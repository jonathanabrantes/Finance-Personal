import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function Dashboard() {
  const { currentUser, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const getThemeInfo = () => {
    if (theme === 'dark') {
      return { icon: '🌙', name: 'Noturno', desc: 'Tema escuro ativo' };
    } else {
      return { icon: '☀️', name: 'Claro', desc: 'Tema branco elegante' };
    }
  };

  const themeInfo = getThemeInfo();

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      <div className="card">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard - Sistema de Finanças Pessoais</h1>
          <div className="dashboard-actions">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              padding: '8px 16px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              fontSize: '14px'
            }}>
              <span style={{ fontSize: '18px' }}>{themeInfo.icon}</span>
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                  {themeInfo.name}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  {themeInfo.desc}
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary">
              Sair
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>Bem-vindo, {currentUser?.first_name || currentUser?.username}!</h2>
          <p>Tipo de usuário: <strong>{currentUser?.user_type === 'admin' ? 'Administrador' : 'Usuário'}</strong></p>
        </div>

        {/* Navegação */}
        <div className="dashboard-grid" style={{ marginBottom: '30px' }}>
          <Link to="/dashboard" className="dashboard-card" style={{ textDecoration: 'none' }}>
            <h3>🏠 Início</h3>
            <p>Visão geral do sistema e estatísticas principais</p>
          </Link>

          {currentUser?.user_type === 'admin' && (
            <Link to="/users" className="dashboard-card" style={{ textDecoration: 'none' }}>
              <h3>👥 Gerenciar Usuários</h3>
              <p>Administrar contas de usuários, permissões e status</p>
            </Link>
          )}

          <div className="dashboard-card">
            <h3>💰 Resumo Financeiro</h3>
            <p>Funcionalidade em desenvolvimento...</p>
          </div>

          <div className="dashboard-card">
            <h3>📊 Transações Recentes</h3>
            <p>Funcionalidade em desenvolvimento...</p>
          </div>

          <div className="dashboard-card">
            <h3>🎯 Metas Financeiras</h3>
            <p>Funcionalidade em desenvolvimento...</p>
          </div>

          <div className="dashboard-card">
            <h3>📈 Relatórios</h3>
            <p>Funcionalidade em desenvolvimento...</p>
          </div>
        </div>

        {/* Painel Administrativo */}
        {currentUser?.user_type === 'admin' && (
          <div className="admin-panel">
            <h3>👑 Painel Administrativo</h3>
            <p>Como administrador, você tem acesso a funcionalidades avançadas do sistema.</p>
            <div style={{ marginTop: '15px' }}>
              <Link to="/users" className="btn btn-primary" style={{ marginRight: '10px' }}>
                Gerenciar Usuários
              </Link>
              <button className="btn btn-secondary">
                Configurações do Sistema
              </button>
            </div>
          </div>
        )}

        {/* Estatísticas Rápidas */}
        <div className="dashboard-grid" style={{ marginTop: '30px' }}>
          <div className="dashboard-card">
            <h3>📊 Estatísticas</h3>
            <p>Total de usuários: <strong>2</strong></p>
            <p>Usuários ativos: <strong>2</strong></p>
            <p>Administradores: <strong>1</strong></p>
          </div>

          <div className="dashboard-card">
            <h3>🔔 Notificações</h3>
            <p>Nenhuma notificação pendente</p>
          </div>

          <div className="dashboard-card">
            <h3>⚡ Sistema</h3>
            <p>Status: <span style={{ color: 'var(--success-color)' }}>✅ Online</span></p>
            <p>Versão: <strong>1.0.0</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
