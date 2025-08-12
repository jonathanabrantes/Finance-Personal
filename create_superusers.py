#!/usr/bin/env python
import os
import django

# Configurar o Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import User

def create_default_users():
    # Criar usuário admin
    if not User.objects.filter(username='admin').exists():
        admin_user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='admin',
            first_name='Administrador',
            last_name='Sistema',
            user_type='admin',
            is_staff=True,
            is_superuser=True
        )
        print(f"Usuário admin criado: {admin_user.username}")
    else:
        print("Usuário admin já existe")
    
    # Criar usuário comum
    if not User.objects.filter(username='user').exists():
        common_user = User.objects.create_user(
            username='user',
            email='user@example.com',
            password='user',
            first_name='Usuário',
            last_name='Comum',
            user_type='user'
        )
        print(f"Usuário comum criado: {common_user.username}")
    else:
        print("Usuário comum já existe")

if __name__ == '__main__':
    create_default_users()
