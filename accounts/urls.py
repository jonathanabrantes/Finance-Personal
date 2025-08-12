from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('csrf/', views.get_csrf_token, name='csrf'),
    path('profile/', views.get_user_profile, name='profile'),
    path('logout/', views.logout_view, name='logout'),
    
    # URLs para gerenciamento de usuários (apenas admin)
    path('users/', views.get_users_list, name='users_list'),
    path('users/<int:user_id>/', views.manage_user, name='manage_user'),
]
