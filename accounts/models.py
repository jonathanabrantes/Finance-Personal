from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from decimal import Decimal

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('admin', 'Administrador'),
        ('user', 'Usuário'),
    )

    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='user')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'

    def __str__(self):
        return self.username

class BankAccount(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bank_accounts')
    name = models.CharField(max_length=100, verbose_name='Nome da Conta')
    color = models.CharField(max_length=7, default='#0066CC', verbose_name='Cor')
    is_active = models.BooleanField(default=True, verbose_name='Ativa')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Conta Bancária'
        verbose_name_plural = 'Contas Bancárias'
        unique_together = ['user', 'name']

    def __str__(self):
        return f"{self.user.username} - {self.name}"

    @property
    def current_balance(self):
        """Calcula o saldo atual da conta"""
        transactions = self.transactions.all()
        balance = Decimal('0.00')
        
        for transaction in transactions:
            if transaction.transaction_type == 'income':
                balance += transaction.amount
            else:
                balance -= transaction.amount
        
        return balance

class CategoryGroup(models.Model):
    TRANSACTION_TYPE_CHOICES = (
        ('income', 'Receita'),
        ('expense', 'Despesa'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='category_groups')
    name = models.CharField(max_length=100, verbose_name='Nome do Grupo')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES, verbose_name='Tipo')
    color = models.CharField(max_length=7, default='#0066CC', verbose_name='Cor')
    is_active = models.BooleanField(default=True, verbose_name='Ativo')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Grupo de Categoria'
        verbose_name_plural = 'Grupos de Categorias'
        unique_together = ['user', 'name', 'transaction_type']

    def __str__(self):
        return f"{self.user.username} - {self.name} ({self.get_transaction_type_display()})"

class BankTransaction(models.Model):
    TRANSACTION_TYPE_CHOICES = (
        ('income', 'Receita'),
        ('expense', 'Despesa'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    bank_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='transactions')
    category_group = models.ForeignKey(CategoryGroup, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES, verbose_name='Tipo')
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Valor')
    description = models.CharField(max_length=200, verbose_name='Descrição')
    transaction_date = models.DateField(verbose_name='Data da Transação')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Transação Bancária'
        verbose_name_plural = 'Transações Bancárias'
        ordering = ['-transaction_date', '-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.description} ({self.amount})"

    @property
    def month_year(self):
        """Retorna o mês/ano da transação para agrupamento"""
        return self.transaction_date.strftime('%Y-%m')

    @property
    def formatted_date(self):
        """Retorna a data formatada em português"""
        return self.transaction_date.strftime('%d/%m/%Y')

    @property
    def formatted_amount(self):
        """Retorna o valor formatado com sinal"""
        if self.transaction_type == 'income':
            return f"+R$ {self.amount:,.2f}"
        else:
            return f"-R$ {self.amount:,.2f}"
