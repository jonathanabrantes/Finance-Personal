import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function Dashboard() {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Dados de exemplo para o gráfico de investimentos
  const [investmentData] = useState([
    {
      name: 'Ações Petrobras',
      history: [
        { month: 'Jan', value: 5000 },
        { month: 'Fev', value: 4800 },
        { month: 'Mar', value: 5100 },
        { month: 'Abr', value: 4950 },
        { month: 'Mai', value: 5300 },
        { month: 'Jun', value: 5150 },
        { month: 'Jul', value: 5400 },
        { month: 'Ago', value: 5200 }
      ]
    },
    {
      name: 'CDB Banco Inter',
      history: [
        { month: 'Mar', value: 10000 },
        { month: 'Abr', value: 10083 },
        { month: 'Mai', value: 10167 },
        { month: 'Jun', value: 10250 },
        { month: 'Jul', value: 10333 },
        { month: 'Ago', value: 10250 }
      ]
    },
    {
      name: 'Bitcoin',
      history: [
        { month: 'Fev', value: 3000 },
        { month: 'Mar', value: 3200 },
        { month: 'Abr', value: 2800 },
        { month: 'Mai', value: 2600 },
        { month: 'Jun', value: 2900 },
        { month: 'Jul', value: 3100 },
        { month: 'Ago', value: 2800 }
      ]
    }
  ]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Theme Info Display
  const getThemeInfo = () => {
    if (theme === 'dark') {
      return { icon: '🌙', name: 'Noturno', desc: 'Tema escuro ativo' };
    } else {
      return { icon: '☀️', name: 'Claro', desc: 'Tema branco elegante' };
    }
  };
  const themeInfo = getThemeInfo();

  // Calcular dados para o gráfico
  const getChartData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'];
    const totalByMonth = months.map(month => {
      const total = investmentData.reduce((sum, investment) => {
        const monthData = investment.history.find(h => h.month === month);
        return sum + (monthData ? monthData.value : 0);
      }, 0);
      return { month, total };
    });
    return totalByMonth;
  };

  const chartData = getChartData();

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      {/* Header do Dashboard */}
      <div className="card">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">🏠 Dashboard</h1>
            <p>Bem-vindo ao seu sistema de finanças pessoais!</p>
          </div>
          
          <div className="dashboard-actions">
            {/* Informações do Tema */}
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

            {/* Botão de Tema */}
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
            </button>

            {/* Botão de Logout */}
            <button className="btn btn-secondary" onClick={handleLogout}>
              🚪 Sair
            </button>
          </div>
        </div>
      </div>

      {/* Painel de Ações Rápidas - PARA TODOS OS USUÁRIOS */}
      <div className="quick-actions-panel" style={{ marginBottom: '30px' }}>
        <h3>🚀 Ações Rápidas</h3>
        <p>Gerencie suas configurações e funcionalidades principais.</p>
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/settings" className="btn btn-primary">
            ⚙️ Configurações Pessoais
          </Link>
          <Link to="/transactions" className="btn btn-primary">
            🏦 Movimentações Bancárias
          </Link>
          <Link to="/investments" className="btn btn-primary">
            💰 Simulador de Investimentos
          </Link>
          <button className="btn btn-secondary">
            📊 Meus Relatórios
          </button>
        </div>
      </div>

      {/* Painel Administrativo - APENAS PARA ADMIN */}
      {currentUser?.user_type === 'admin' && (
        <div className="admin-panel" style={{ marginBottom: '30px' }}>
          <h3>👑 Painel Administrativo</h3>
          <p>Como administrador, você tem acesso a funcionalidades avançadas do sistema.</p>
          <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/users" className="btn btn-primary">
              👥 Gerenciar Usuários
            </Link>
            <button className="btn btn-secondary">
              📊 Relatórios do Sistema
            </button>
            <button className="btn btn-secondary">
              🔧 Configurações Globais
            </button>
          </div>
        </div>
      )}

      {/* Gráfico de Evolução dos Investimentos */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <div className="dashboard-header">
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '10px' }}>
            📈 Evolução dos Investimentos
          </h2>
          <p>Acompanhe a evolução do valor total dos seus investimentos ao longo dos meses</p>
        </div>
        
        <div style={{ padding: '30px' }} className="chart-container">
          <div style={{ 
            height: '300px', 
            display: 'flex', 
            alignItems: 'end', 
            gap: '8px',
            padding: '20px 0',
            borderBottom: '3px solid var(--border-color)',
            borderLeft: '3px solid var(--border-color)',
            position: 'relative',
            overflowX: 'auto'
          }} className="chart-bars">
            {chartData.map((data, index) => {
              const maxTotal = Math.max(...chartData.map(d => d.total));
              const height = maxTotal > 0 ? (data.total / maxTotal) * 240 : 0;
              const width = Math.max(60, 600 / chartData.length);
              
              return (
                <div key={data.month} style={{ 
                  width: `${width}px`,
                  height: `${height}px`,
                  background: 'linear-gradient(135deg, var(--accent-color), var(--success-color))',
                  borderRadius: '8px 8px 0 0',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'end',
                  minWidth: '60px',
                  transition: 'all 0.3s ease'
                }} className="chart-bar">
                  {/* Valor no topo */}
                  <div style={{ 
                    position: 'absolute', 
                    top: '-30px', 
                    fontSize: '12px', 
                    color: 'var(--text-primary)',
                    fontWeight: '500',
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                  }} className="chart-value">
                    R$ {data.total.toLocaleString('pt-BR')}
                  </div>
                  
                  {/* Mês na base */}
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '-25px', 
                    fontSize: '12px', 
                    color: 'var(--text-secondary)',
                    fontWeight: '500',
                    textAlign: 'center'
                  }} className="chart-date">
                    {data.month}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legenda */}
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            flexWrap: 'wrap', 
            marginTop: '40px',
            justifyContent: 'center'
          }} className="chart-legend">
            {investmentData.map((investment, index) => (
              <div key={investment.name} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                fontSize: '14px'
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: `hsl(${index * 120}, 70%, 50%)`,
                  borderRadius: '50%' 
                }} />
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                  {investment.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid do Dashboard */}
      <div className="dashboard-grid">
        <Link to="/settings" className="dashboard-card" style={{ textDecoration: 'none' }}>
          <h3>⚙️ Configurações</h3>
          <p>Gerencie suas contas bancárias e categorias</p>
        </Link>
        
        <Link to="/transactions" className="dashboard-card" style={{ textDecoration: 'none' }}>
          <h3>🏦 Movimentações</h3>
          <p>Controle suas receitas, despesas e saldos bancários</p>
        </Link>
        
        <Link to="/investments" className="dashboard-card" style={{ textDecoration: 'none' }}>
          <h3>💰 Investimentos</h3>
          <p>Acompanhe o histórico e desempenho dos seus investimentos reais</p>
        </Link>
        
        <div className="dashboard-card">
          <h3>📊 Relatórios</h3>
          <p>Visualize relatórios e análises financeiras</p>
        </div>
        
        <div className="dashboard-card">
          <h3>🎯 Metas</h3>
          <p>Defina e acompanhe suas metas financeiras</p>
        </div>
        
        <div className="dashboard-card">
          <h3>🔔 Notificações</h3>
          <p>Configure alertas e lembretes financeiros</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
