from django.shortcuts import render
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.middleware.csrf import get_token
from django.http import JsonResponse
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class LoginView(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = LoginSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        login(request, user)
        
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Login realizado com sucesso'
        })

@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    """Endpoint para obter token CSRF"""
    return JsonResponse({'csrfToken': get_token(request)})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({"message": "Logout realizado com sucesso"})

# Views para gerenciamento de usuários (apenas admin)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users_list(request):
    """Lista todos os usuários (apenas para admin)"""
    if request.user.user_type != 'admin':
        return Response(
            {"error": "Acesso negado. Apenas administradores podem ver esta lista."}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    users = User.objects.all().order_by('-created_at')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET', 'PUT', 'DELETE', 'PATCH'])
@permission_classes([IsAuthenticated])
def manage_user(request, user_id):
    """Gerenciar usuário específico (apenas para admin)"""
    if request.user.user_type != 'admin':
        return Response(
            {"error": "Acesso negado. Apenas administradores podem gerenciar usuários."}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {"error": "Usuário não encontrado"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'PATCH':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Não permitir excluir o próprio usuário
        if user.id == request.user.id:
            return Response(
                {"error": "Não é possível excluir sua própria conta"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        user.delete()
        return Response({"message": "Usuário excluído com sucesso"})
