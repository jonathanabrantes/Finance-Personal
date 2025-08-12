from django.shortcuts import render
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import datetime, timedelta
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer, UserUpdateSerializer,
    BankAccountSerializer, CategoryGroupSerializer, BankTransactionSerializer,
    FinancialSummarySerializer
)
from .models import User, BankAccount, CategoryGroup, BankTransaction

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

# Views para Contas Bancárias
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def bank_accounts_view(request):
    """Listar e criar contas bancárias do usuário"""
    if request.method == 'GET':
        accounts = BankAccount.objects.filter(user=request.user, is_active=True).order_by('name')
        serializer = BankAccountSerializer(accounts, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = BankAccountSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def bank_account_detail(request, account_id):
    """Gerenciar conta bancária específica"""
    try:
        account = BankAccount.objects.get(id=account_id, user=request.user)
    except BankAccount.DoesNotExist:
        return Response(
            {"error": "Conta bancária não encontrada"},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = BankAccountSerializer(account, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = BankAccountSerializer(account, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        account.delete()
        return Response({"message": "Conta bancária excluída com sucesso"})

# Views para Grupos de Categorias
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def category_groups_view(request):
    """Listar e criar grupos de categorias do usuário"""
    if request.method == 'GET':
        groups = CategoryGroup.objects.filter(user=request.user, is_active=True).order_by('transaction_type', 'name')
        serializer = CategoryGroupSerializer(groups, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CategoryGroupSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def category_group_detail(request, group_id):
    """Gerenciar grupo de categoria específico"""
    try:
        group = CategoryGroup.objects.get(id=group_id, user=request.user)
    except CategoryGroup.DoesNotExist:
        return Response(
            {"error": "Grupo de categoria não encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = CategoryGroupSerializer(group, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = CategoryGroupSerializer(group, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        group.delete()
        return Response({"message": "Grupo de categoria excluído com sucesso"})

# Views para Transações Bancárias
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def transactions_view(request):
    """Listar e criar transações do usuário"""
    if request.method == 'GET':
        # Filtrar por mês se especificado
        month_year = request.GET.get('month_year')
        if month_year:
            try:
                # Converter YYYY-MM para filtro de data
                year, month = month_year.split('-')
                start_date = datetime(int(year), int(month), 1).date()
                if int(month) == 12:
                    end_date = datetime(int(year) + 1, 1, 1).date() - timedelta(days=1)
                else:
                    end_date = datetime(int(year), int(month) + 1, 1).date() - timedelta(days=1)

                transactions = BankTransaction.objects.filter(
                    user=request.user,
                    transaction_date__range=[start_date, end_date]
                ).order_by('-transaction_date', '-created_at')
            except ValueError:
                return Response(
                    {"error": "Formato de mês inválido. Use YYYY-MM"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # Últimos 6 meses por padrão
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=180)
            transactions = BankTransaction.objects.filter(
                user=request.user,
                transaction_date__range=[start_date, end_date]
            ).order_by('-transaction_date', '-created_at')

        serializer = BankTransactionSerializer(transactions, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = BankTransactionSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def transaction_detail(request, transaction_id):
    """Gerenciar transação específica"""
    try:
        transaction = BankTransaction.objects.get(id=transaction_id, user=request.user)
    except BankTransaction.DoesNotExist:
        return Response(
            {"error": "Transação não encontrada"},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = BankTransactionSerializer(transaction, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = BankTransactionSerializer(transaction, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        transaction.delete()
        return Response({"message": "Transação excluída com sucesso"})

# View para resumo financeiro
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def financial_summary(request):
    """Resumo financeiro do usuário por mês"""
    month_year = request.GET.get('month_year')

    if not month_year:
        # Usar mês atual se não especificado
        month_year = timezone.now().strftime('%Y-%m')

    try:
        year, month = month_year.split('-')
        start_date = datetime(int(year), int(month), 1).date()
        if int(month) == 12:
            end_date = datetime(int(year) + 1, 1, 1).date() - timedelta(days=1)
        else:
            end_date = datetime(int(year), int(month) + 1, 1).date() - timedelta(days=1)

        transactions = BankTransaction.objects.filter(
            user=request.user,
            transaction_date__range=[start_date, end_date]
        )

        total_income = transactions.filter(transaction_type='income').aggregate(
            total=Sum('amount'))['total'] or 0
        total_expense = transactions.filter(transaction_type='expense').aggregate(
            total=Sum('amount'))['total'] or 0
        transaction_count = transactions.count()
        balance = total_income - total_expense

        summary = {
            'month_year': month_year,
            'total_income': total_income,
            'total_expense': total_expense,
            'balance': balance,
            'transaction_count': transaction_count
        }

        serializer = FinancialSummarySerializer(summary)
        return Response(serializer.data)

    except ValueError:
        return Response(
            {"error": "Formato de mês inválido. Use YYYY-MM"},
            status=status.HTTP_400_BAD_REQUEST
        )
