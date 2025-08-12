from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.get_user_profile, name='profile'),
    path('csrf/', views.get_csrf_token, name='csrf'),
    
    # URLs para gerenciamento de usuários (apenas admin)
    path('users/', views.get_users_list, name='users_list'),
    path('users/<int:user_id>/', views.manage_user, name='manage_user'),
    
    # URLs para contas bancárias
    path('bank-accounts/', views.bank_accounts_view, name='bank_accounts'),
    path('bank-accounts/<int:account_id>/', views.bank_account_detail, name='bank_account_detail'),
    
    # URLs para grupos de categorias
    path('category-groups/', views.category_groups_view, name='category_groups'),
    path('category-groups/<int:group_id>/', views.category_group_detail, name='category_group_detail'),
    
    # URLs para transações bancárias
    path('transactions/', views.transactions_view, name='transactions'),
    path('transactions/<int:transaction_id>/', views.transaction_detail, name='transaction_detail'),
    
    # URL para resumo financeiro
    path('financial-summary/', views.financial_summary, name='financial_summary'),
]
