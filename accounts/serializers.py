from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, BankAccount, CategoryGroup, BankTransaction

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'user_type', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("As senhas não coincidem.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Credenciais inválidas.')
            if not user.is_active:
                raise serializers.ValidationError('Usuário está inativo.')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Username e senha são obrigatórios.')

        return attrs

class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer para atualização de usuários pelo admin"""
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'user_type', 'is_active')

    def validate_user_type(self, value):
        # Permitir que admin mude o tipo de usuário
        return value

# Serializers para Contas Bancárias
class BankAccountSerializer(serializers.ModelSerializer):
    current_balance = serializers.ReadOnlyField()

    class Meta:
        model = BankAccount
        fields = ('id', 'name', 'color', 'is_active', 'current_balance', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

# Serializers para Grupos de Categorias
class CategoryGroupSerializer(serializers.ModelSerializer):
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)

    class Meta:
        model = CategoryGroup
        fields = ('id', 'name', 'transaction_type', 'transaction_type_display', 'color', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

# Serializers para Transações Bancárias
class BankTransactionSerializer(serializers.ModelSerializer):
    bank_account_name = serializers.CharField(source='bank_account.name', read_only=True)
    category_group_name = serializers.CharField(source='category_group.name', read_only=True)
    formatted_amount = serializers.ReadOnlyField()
    formatted_date = serializers.ReadOnlyField()
    month_year = serializers.ReadOnlyField()

    class Meta:
        model = BankTransaction
        fields = (
            'id', 'bank_account', 'bank_account_name', 'category_group', 'category_group_name',
            'transaction_type', 'amount', 'description', 'transaction_date', 'formatted_amount',
            'formatted_date', 'month_year', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def validate(self, attrs):
        # Validar se a conta bancária pertence ao usuário
        bank_account = attrs.get('bank_account')
        if bank_account and bank_account.user != self.context['request'].user:
            raise serializers.ValidationError("Conta bancária inválida.")

        # Validar se o grupo de categoria pertence ao usuário
        category_group = attrs.get('category_group')
        if category_group and category_group.user != self.context['request'].user:
            raise serializers.ValidationError("Grupo de categoria inválido.")

        # Validar se o tipo de transação corresponde ao grupo de categoria
        transaction_type = attrs.get('transaction_type')
        if category_group and transaction_type != category_group.transaction_type:
            raise serializers.ValidationError("Tipo de transação deve corresponder ao grupo de categoria.")

        return attrs

# Serializer para resumo financeiro
class FinancialSummarySerializer(serializers.Serializer):
    month_year = serializers.CharField()
    total_income = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_expense = serializers.DecimalField(max_digits=10, decimal_places=2)
    balance = serializers.DecimalField(max_digits=10, decimal_places=2)
    transaction_count = serializers.IntegerField()
