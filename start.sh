#!/bin/bash

echo "🚀 Iniciando Sistema de Finanças Pessoais..."
echo "================================================"

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker compose down

# Remover imagens antigas (opcional)
echo "🧹 Limpando imagens antigas..."
docker compose down --rmi all

# Construir e iniciar todos os serviços
echo "🔨 Construindo e iniciando serviços..."
docker compose up --build -d

echo "⏳ Aguardando serviços inicializarem..."
sleep 30

echo ""
echo "🎉 Sistema iniciado com sucesso!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8000"
echo "🗄️ Admin Django: http://localhost:8000/admin"
echo ""
echo "🔑 Usuários de teste:"
echo "   Admin: admin / admin"
echo "   Usuário: user / user"
echo ""
echo "📊 Para ver logs: docker compose logs -f"
echo "🛑 Para parar: docker compose down"
echo "================================================"
