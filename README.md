# 💰 Sistema de Finanças Pessoais

Um sistema completo de gerenciamento financeiro pessoal desenvolvido com Django, React e PostgreSQL, containerizado com Docker.

## 🚀 **Funcionalidades**

### 🔐 **Autenticação e Usuários**
- **Sistema de Login/Registro** com autenticação por sessão
- **Dois tipos de usuário**: Administrador e Usuário comum
- **Gerenciamento de usuários** (apenas para administradores)
  - Listar todos os usuários
  - Editar informações de usuários
  - Ativar/Desativar usuários
  - Excluir usuários (exceto próprio)

### 💹 **Gestão de Investimentos**
- **Dashboard de Investimentos** com visão geral completa
- **Histórico de Investimentos** com tabela detalhada
- **Histórico Temporal** com gráficos de evolução
- **Sistema de Aportes** para adicionar valores aos investimentos
- **Sistema de Rendimentos** para registrar variações percentuais
- **Edição de Aportes** existentes com recálculo automático
- **Filtros por tipo** e status de investimento
- **Cálculo automático de ROI** e resultados
- **Suporte a múltiplos tipos**: Ações, Renda Fixa, Criptomoedas, Imóveis

### 🎨 **Temas Visuais**
- **Tema Noturno** como padrão (interface escura elegante)
- **Tema Claro** alternativo (design branco minimalista)
- **Switcher de tema** no canto superior direito
- **Persistência** da escolha do usuário
- **Transições suaves** entre temas

### 💻 **Interface Moderna**
- **Dashboard responsivo** com cards interativos
- **Navegação intuitiva** entre funcionalidades
- **Design adaptativo** para todos os dispositivos
- **Hover effects** e animações suaves

## 🛠️ **Tecnologias Utilizadas**

### **Backend**
- **Django 5.0.2** - Framework web Python
- **Django REST Framework** - API REST
- **PostgreSQL 15** - Banco de dados relacional
- **Python 3.11** - Linguagem de programação

### **Frontend**
- **React 18** - Biblioteca JavaScript para interfaces
- **React Router** - Roteamento de páginas
- **Axios** - Cliente HTTP para APIs
- **CSS Variables** - Sistema de temas dinâmicos
- **Chart.js** - Gráficos para histórico temporal
- **Responsive Design** - Interface adaptativa para todos os dispositivos

### **Infraestrutura**
- **Docker** - Containerização de aplicações
- **Docker Compose** - Orquestração de serviços
- **Nginx** - Servidor web (opcional)

## 📋 **Pré-requisitos**

- **Docker** e **Docker Compose** instalados
- **Porta 3000** disponível para o frontend
- **Porta 8000** disponível para o backend
- **Porta 5432** disponível para o PostgreSQL

## 🚀 **Instalação e Execução**

### **Opção 1: Docker (Recomendado)**

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd Finance-Personal

# 2. Execute com Docker Compose
sudo docker compose up -d

# 3. Acesse o sistema
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

### **Opção 2: Script Automatizado**

```bash
# Execute o script de inicialização
chmod +x start.sh
./start.sh
```

### **Opção 3: Instalação Manual (Legado)**

```bash
# 1. Configure o ambiente Python
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 2. Configure o banco PostgreSQL
# Crie um banco 'finance_personal' com usuário 'admin' e senha 'admin'

# 3. Execute as migrações
python manage.py makemigrations
python manage.py migrate

# 4. Crie usuários padrão
python create_superusers.py

# 5. Inicie o backend
python manage.py runserver

# 6. Em outro terminal, inicie o frontend
cd frontend
npm install
npm start
```

## 🔑 **Usuários Padrão**

### **Administrador**
- **Usuário**: `admin`
- **Senha**: `admin`
- **Tipo**: Administrador
- **Permissões**: Acesso total ao sistema

### **Usuário Comum**
- **Usuário**: `user`
- **Senha**: `user`
- **Tipo**: Usuário
- **Permissões**: Acesso básico ao sistema

## 🎨 **Sistema de Temas**

### **🌙 Tema Noturno (Padrão)**
- **Fundo**: Preto profundo (#1a1a1a)
- **Cards**: Cinza escuro (#2d2d2d)
- **Gradiente**: Azul escuro para azul médio
- **Texto**: Branco puro para máximo contraste

### **☀️ Tema Claro (Alternativo)**
- **Fundo**: Branco puro (#ffffff)
- **Cards**: Branco suave (#fafafa)
- **Gradiente**: Branco para cinza muito claro
- **Texto**: Azul escuro elegante (#2c3e50)

### **Como Alternar Temas**
1. Clique no botão no canto superior direito
2. O sistema alterna automaticamente entre os temas
3. Sua escolha é salva e mantida entre sessões

## 👥 **Gerenciamento de Usuários (Admin)**

### **Funcionalidades Disponíveis**
- **Listar Usuários**: Visualizar todos os usuários do sistema
- **Editar Usuários**: Modificar informações pessoais e tipo
- **Ativar/Desativar**: Controlar status de acesso dos usuários
- **Excluir Usuários**: Remover contas (exceto própria)

### **Como Acessar**
1. Faça login como usuário `admin`
2. No dashboard, clique em "Gerenciar Usuários"
3. Ou acesse diretamente: `/users`

## 🐳 **Comandos Docker Úteis**

```bash
# Iniciar todos os serviços
sudo docker compose up -d

# Ver logs dos serviços
sudo docker compose logs -f

# Parar todos os serviços
sudo docker compose down

# Reiniciar um serviço específico
sudo docker compose restart frontend
sudo docker compose restart backend

# Reconstruir imagens
sudo docker compose build --no-cache

# Limpar tudo (volumes e imagens)
sudo docker compose down --volumes --rmi all
```

## 📁 **Estrutura do Projeto**

```
Finance-Personal/
├── backend/                 # Aplicação Django
│   ├── settings.py         # Configurações do projeto
│   └── urls.py            # URLs principais
├── accounts/               # App de autenticação
│   ├── models.py          # Modelo de usuário customizado
│   ├── views.py           # Views da API
│   ├── serializers.py     # Serializers para JSON
│   └── urls.py            # URLs de autenticação
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   │   ├── Dashboard.js      # Dashboard principal
│   │   │   ├── Investments.js    # Gestão de investimentos
│   │   │   ├── Users.js          # Gerenciamento de usuários
│   │   │   └── Auth.js           # Componentes de autenticação
│   │   ├── contexts/      # Contextos (Auth, Theme)
│   │   └── App.js         # Componente principal
│   └── package.json       # Dependências Node.js
├── docker-compose.yml      # Configuração Docker
├── Dockerfile.backend      # Dockerfile do backend
├── Dockerfile.frontend     # Dockerfile do frontend
├── requirements.txt        # Dependências Python
├── create_superusers.py    # Script de criação de usuários
└── README.md              # Este arquivo
```

## ⚙️ **Variáveis de Ambiente**

### **Backend (Django)**
```bash
DEBUG=True
SECRET_KEY=django-insecure-your-secret-key-here
DATABASE_URL=postgresql://admin:admin@db:5432/finance_personal
ALLOWED_HOSTS=localhost,127.0.0.1,backend
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://frontend:3000
```

### **Frontend (React)**
```bash
REACT_APP_API_URL=http://localhost:8000
```

### **PostgreSQL**
```bash
POSTGRES_DB=finance_personal
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
```

## 🔒 **Segurança e Autenticação**

### **Sistema de Autenticação**
- **Sessões Django** para autenticação
- **CSRF Protection** habilitado
- **Cookies seguros** configurados
- **Permissões baseadas** em tipo de usuário

### **Proteções Implementadas**
- **Validação de entrada** em todos os formulários
- **Sanitização de dados** automática
- **Controle de acesso** por tipo de usuário
- **Proteção contra** exclusão de conta própria

## 🧪 **Testando o Sistema**

### **1. Verificar Serviços**
```bash
# Verificar se todos os containers estão rodando
sudo docker compose ps

# Verificar logs
sudo docker compose logs
```

### **2. Testar API**
```bash
# Testar endpoint de login
curl -X POST http://localhost:8000/api/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

### **3. Acessar Interface**
- **Frontend**: http://localhost:3000
- **Backend Admin**: http://localhost:8000/admin
- **API**: http://localhost:8000/api/

## 🐛 **Solução de Problemas**

### **Problema: Porta já em uso**
```bash
# Verificar processos usando as portas
sudo lsof -i :3000
sudo lsof -i :8000
sudo lsof -i :5432

# Parar processos conflitantes
sudo kill -9 <PID>
```

### **Problema: Erro de permissão Docker**
```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
# Reboot necessário
```

### **Problema: Banco não conecta**
```bash
# Verificar se PostgreSQL está rodando
sudo docker compose logs db

# Reiniciar apenas o banco
sudo docker compose restart db
```

### **Problema: Frontend não carrega**
```bash
# Verificar logs do frontend
sudo docker compose logs frontend

# Reinstalar dependências
sudo docker compose exec frontend npm install
```

## 📱 **Responsividade**

O sistema é totalmente responsivo e funciona em:
- **Desktop** (1024px+)
- **Tablet** (768px - 1023px)
- **Mobile** (até 767px)

## 🚀 **Próximas Funcionalidades**

- [x] **Dashboard Financeiro** com gráficos e estatísticas ✅
- [x] **Gestão de Investimentos** com histórico completo ✅
- [x] **Sistema de Aportes** para investimentos ✅
- [x] **Sistema de Rendimentos** percentuais ✅
- [x] **Edição de Aportes** com recálculo automático ✅
- [x] **Histórico Temporal** com gráficos ✅
- [ ] **Gestão de Receitas e Despesas**
- [ ] **Categorização de Transações**
- [ ] **Relatórios Mensais/Anuais**
- [ ] **Metas Financeiras**
- [ ] **Notificações e Lembretes**
- [ ] **Backup Automático**
- [ ] **API Externa** para integrações

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 **Suporte**

Para suporte e dúvidas:
- **Issues**: Abra uma issue no GitHub
- **Documentação**: Consulte este README
- **Comunidade**: Participe das discussões

## 🎯 **Status Atual**

**✅ 100% FUNCIONAL!**

- **Backend Django** funcionando perfeitamente
- **Frontend React** com interface moderna
- **Banco PostgreSQL** configurado e rodando
- **Docker Compose** orquestrando todos os serviços
- **Sistema de temas** implementado (noturno/claro)
- **Gerenciamento de usuários** para administradores
- **Autenticação segura** por sessões
- **Interface responsiva** para todos os dispositivos
- **Sistema completo de investimentos** com aportes e rendimentos
- **Histórico temporal** com gráficos interativos
- **Edição de aportes** com recálculo automático
- **Dashboard financeiro** com estatísticas avançadas

### **Para começar agora:**
```bash
sudo docker compose up -d
# Acesse: http://localhost:3000
# Login: admin/admin ou user/user
```

**O sistema está pronto para uso em produção! 🚀✨**