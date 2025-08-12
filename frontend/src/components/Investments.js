import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Investments() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('investments');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para novo investimento
  const [newInvestment, setNewInvestment] = useState({
    name: '',
    type: 'stock', // stock, bond, crypto, real_estate, other
    initialValue: '',
    currentValue: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    description: '',
    status: 'active' // active, sold, closed
  });

  // Estados para histórico de investimentos
  const [investments, setInvestments] = useState([
    // Dados de exemplo com histórico temporal
    {
      id: 1,
      name: 'Ações Petrobras',
      type: 'stock',
      initialValue: 5000.00,
      currentValue: 5700.00,
      purchaseDate: '2024-01-15',
      description: 'Ações preferenciais da Petrobras',
      status: 'active',
      lastUpdate: '2024-08-25',
      valueHistory: [
        { date: '2024-01-15', value: 5000.00, note: 'Compra inicial' },
        { date: '2024-02-15', value: 4800.00, note: 'Queda do mercado' },
        { date: '2024-03-15', value: 5100.00, note: 'Recuperação' },
        { date: '2024-04-15', value: 4950.00, note: 'Volatilidade' },
        { date: '2024-05-15', value: 5300.00, note: 'Alta do petróleo' },
        { date: '2024-06-15', value: 5150.00, note: 'Correção' },
        { date: '2024-07-15', value: 5400.00, note: 'Bom trimestre' },
        { date: '2024-08-12', value: 5200.00, note: 'Atualização' },
        { date: '2024-08-15', value: 5700.00, note: 'Aporte: +R$ 500,00 - Aporte mensal' }
      ]
    },
    {
      id: 2,
      name: 'CDB Banco Inter',
      type: 'bond',
      initialValue: 10000.00,
      currentValue: 10850.00,
      purchaseDate: '2024-03-20',
      description: 'CDB com vencimento em 2025',
      status: 'active',
      lastUpdate: '2024-08-25',
      valueHistory: [
        { date: '2024-03-20', value: 10000.00, note: 'Aplicação inicial' },
        { date: '2024-04-20', value: 10083.33, note: 'Rendimento mensal' },
        { date: '2024-05-20', value: 10166.67, note: 'Rendimento mensal' },
        { date: '2024-06-20', value: 10250.00, note: 'Rendimento mensal' },
        { date: '2024-07-20', value: 10333.33, note: 'Rendimento mensal' },
        { date: '2024-08-12', value: 10250.00, note: 'Atualização' },
        { date: '2024-08-20', value: 10850.00, note: 'Aporte: +R$ 600,00 - Aporte trimestral' }
      ]
    },
    {
      id: 3,
      name: 'Bitcoin',
      type: 'crypto',
      initialValue: 3000.00,
      currentValue: 3300.00,
      purchaseDate: '2024-02-10',
      description: 'Criptomoeda Bitcoin',
      status: 'active',
      lastUpdate: '2024-08-25',
      valueHistory: [
        { date: '2024-02-10', value: 3000.00, note: 'Compra inicial' },
        { date: '2024-03-10', value: 3200.00, note: 'Alta do Bitcoin' },
        { date: '2024-04-10', value: 2800.00, note: 'Correção forte' },
        { date: '2024-05-10', value: 2600.00, note: 'Mercado em baixa' },
        { date: '2024-06-10', value: 2900.00, note: 'Recuperação' },
        { date: '2024-07-10', value: 3100.00, note: 'Nova alta' },
        { date: '2024-08-12', value: 2800.00, note: 'Atualização' },
        { date: '2024-08-25', value: 3300.00, note: 'Aporte: +R$ 500,00 - Compra de oportunidade' }
      ]
    }
  ]);

  // Estados para filtros
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Estados para histórico temporal
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [newHistoryEntry, setNewHistoryEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    value: '',
    note: ''
  });

  // Estados para aportes e rendimentos
  const [showAporteModal, setShowAporteModal] = useState(false);
  const [showRendimentoModal, setShowRendimentoModal] = useState(false);
  const [selectedInvestmentForOperation, setSelectedInvestmentForOperation] = useState(null);
  const [newAporte, setNewAporte] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    note: ''
  });
  const [newRendimento, setNewRendimento] = useState({
    date: new Date().toISOString().split('T')[0],
    percentage: '',
    note: ''
  });

  // Estados para edição de aportes
  const [showEditAporteModal, setShowEditAporteModal] = useState(false);
  const [editingAporte, setEditingAporte] = useState(null);
  const [editAporteData, setEditAporteData] = useState({
    date: '',
    amount: '',
    note: ''
  });

  // Tipos de investimento
  const investmentTypes = [
    { value: 'stock', label: '📈 Ações', color: '#28A745' },
    { value: 'bond', label: '🏦 Renda Fixa', color: '#007BFF' },
    { value: 'crypto', label: '₿ Criptomoedas', color: '#FFC107' },
    { value: 'real_estate', label: '🏠 Imóveis', color: '#6F42C1' },
    { value: 'other', label: '💡 Outros', color: '#6C757D' }
  ];

  // Status dos investimentos
  const investmentStatuses = [
    { value: 'active', label: '🟢 Ativo', color: '#28A745' },
    { value: 'sold', label: '🟡 Vendido', color: '#FFC107' },
    { value: 'closed', label: '🔴 Encerrado', color: '#DC3545' }
  ];

  // Adicionar novo investimento
  const addInvestment = (e) => {
    e.preventDefault();
    
    if (!newInvestment.name || !newInvestment.initialValue || !newInvestment.currentValue) {
      setError('Nome, valor inicial e valor atual são obrigatórios');
      return;
    }

    try {
      const investment = {
        id: Date.now(),
        ...newInvestment,
        initialValue: parseFloat(newInvestment.initialValue),
        currentValue: parseFloat(newInvestment.currentValue),
        lastUpdate: new Date().toISOString().split('T')[0],
        valueHistory: [
          {
            date: newInvestment.purchaseDate,
            value: parseFloat(newInvestment.initialValue),
            note: 'Compra inicial'
          },
          {
            date: new Date().toISOString().split('T')[0],
            value: parseFloat(newInvestment.currentValue),
            note: 'Valor atual'
          }
        ]
      };

      setInvestments([investment, ...investments]);
      
      setSuccess('Investimento adicionado com sucesso!');
      setNewInvestment({
        name: '',
        type: 'stock',
        initialValue: '',
        currentValue: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        description: '',
        status: 'active'
      });
      
    } catch (error) {
      setError('Erro ao adicionar investimento');
      console.error('Erro:', error);
    }
  };

  // Adicionar entrada no histórico
  const addHistoryEntry = (investmentId) => {
    if (!newHistoryEntry.date || !newHistoryEntry.value) {
      setError('Data e valor são obrigatórios');
      return;
    }

    const entry = {
      date: newHistoryEntry.date,
      value: parseFloat(newHistoryEntry.value),
      note: newHistoryEntry.note || 'Atualização'
    };

    setInvestments(investments.map(inv => {
      if (inv.id === investmentId) {
        const updatedHistory = [...inv.valueHistory, entry].sort((a, b) => new Date(a.date) - new Date(b.date));
        return {
          ...inv,
          currentValue: entry.value,
          lastUpdate: entry.date,
          valueHistory: updatedHistory
        };
      }
      return inv;
    }));

    setNewHistoryEntry({
      date: new Date().toISOString().split('T')[0],
      value: '',
      note: ''
    });

    setSuccess('Entrada no histórico adicionada com sucesso!');
  };

  // Atualizar valor do investimento
  const updateInvestmentValue = (id, newValue) => {
    setInvestments(investments.map(inv => 
      inv.id === id 
        ? { ...inv, currentValue: parseFloat(newValue), lastUpdate: new Date().toISOString().split('T')[0] }
        : inv
    ));
  };

  // Alterar status do investimento
  const changeInvestmentStatus = (id, newStatus) => {
    setInvestments(investments.map(inv => 
      inv.id === id 
        ? { ...inv, status: newStatus, lastUpdate: new Date().toISOString().split('T')[0] }
        : inv
    ));
  };

  // Excluir investimento
  const deleteInvestment = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este investimento?')) {
      setInvestments(investments.filter(inv => inv.id !== id));
      setSuccess('Investimento excluído com sucesso!');
    }
  };

  // Excluir entrada do histórico
  const deleteHistoryEntry = (investmentId, entryDate) => {
    if (window.confirm('Tem certeza que deseja excluir esta entrada do histórico?')) {
      setInvestments(investments.map(inv => {
        if (inv.id === investmentId) {
          const updatedHistory = inv.valueHistory.filter(entry => entry.date !== entryDate);
          const lastEntry = updatedHistory[updatedHistory.length - 1];
          return {
            ...inv,
            currentValue: lastEntry ? lastEntry.value : inv.initialValue,
            lastUpdate: lastEntry ? lastEntry.date : inv.purchaseDate,
            valueHistory: updatedHistory
          };
        }
        return inv;
      }));
      setSuccess('Entrada do histórico excluída com sucesso!');
    }
  };

  // Adicionar novo aporte
  const addAporte = (investmentId) => {
    if (!newAporte.amount || parseFloat(newAporte.amount) <= 0) {
      setError('Valor do aporte deve ser maior que zero');
      return;
    }

    const investment = investments.find(inv => inv.id === investmentId);
    if (!investment) return;

    const aporteAmount = parseFloat(newAporte.amount);
    const newValue = investment.currentValue + aporteAmount;
    
    const entry = {
      date: newAporte.date,
      value: newValue,
      note: `Aporte: +R$ ${aporteAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} - ${newAporte.note || 'Novo aporte'}`
    };

    setInvestments(investments.map(inv => {
      if (inv.id === investmentId) {
        const updatedHistory = [...inv.valueHistory, entry].sort((a, b) => new Date(a.date) - new Date(b.date));
        return {
          ...inv,
          currentValue: newValue,
          lastUpdate: entry.date,
          valueHistory: updatedHistory
        };
      }
      return inv;
    }));

    setNewAporte({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      note: ''
    });
    setShowAporteModal(false);
    setSuccess(`Aporte de R$ ${aporteAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} adicionado com sucesso!`);
  };

  // Adicionar rendimento
  const addRendimento = (investmentId) => {
    if (!newRendimento.percentage) {
      setError('Percentual de rendimento é obrigatório');
      return;
    }

    const percentage = parseFloat(newRendimento.percentage);
    if (percentage === 0) {
      setError('Percentual de rendimento deve ser diferente de zero');
      return;
    }

    const investment = investments.find(inv => inv.id === investmentId);
    if (!investment) return;

    const currentValue = investment.currentValue;
    const newValue = currentValue * (1 + percentage / 100);
    const variation = newValue - currentValue;
    
    const entry = {
      date: newRendimento.date,
      value: newValue,
      note: `Rendimento: ${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}% (${percentage >= 0 ? '+' : ''}R$ ${variation.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) - ${newRendimento.note || 'Rendimento registrado'}`
    };

    setInvestments(investments.map(inv => {
      if (inv.id === investmentId) {
        const updatedHistory = [...inv.valueHistory, entry].sort((a, b) => new Date(a.date) - new Date(b.date));
        return {
          ...inv,
          currentValue: newValue,
          lastUpdate: entry.date,
          valueHistory: updatedHistory
        };
      }
      return inv;
    }));

    setNewRendimento({
      date: new Date().toISOString().split('T')[0],
      percentage: '',
      note: ''
    });
    setShowRendimentoModal(false);
    setSuccess(`Rendimento de ${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}% registrado com sucesso!`);
  };

  // Editar aporte existente
  const editAporte = (investmentId, aporteEntry) => {
    console.log('Editando aporte:', { investmentId, aporteEntry, editAporteData }); // Debug
    
    if (!editAporteData.amount || parseFloat(editAporteData.amount) <= 0) {
      setError('Valor do aporte deve ser maior que zero');
      return;
    }

    const investment = investments.find(inv => inv.id === investmentId);
    if (!investment) {
      setError('Investimento não encontrado');
      return;
    }

    try {
      // Atualizar a entrada do aporte
      const updatedHistory = investment.valueHistory.map(entry => {
        if (entry.date === aporteEntry.date && entry.note.includes('Aporte:')) {
          return {
            ...entry,
            date: editAporteData.date,
            note: `Aporte: +R$ ${parseFloat(editAporteData.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} - ${editAporteData.note || 'Aporte editado'}`
          };
        }
        return entry;
      });

      // Recalcular valores de forma mais simples
      let currentValue = investment.initialValue;
      const recalculatedHistory = updatedHistory.map(entry => {
        if (entry.note.includes('Aporte:')) {
          const aporteValue = parseFloat(entry.note.match(/Aporte: \+R\$ ([\d,]+\.?\d*)/)?.[1]?.replace(',', '') || '0');
          currentValue += aporteValue;
        }
        return {
          ...entry,
          value: currentValue
        };
      });

      // Atualizar o investimento
      const updatedInvestment = {
        ...investment,
        currentValue: currentValue,
        lastUpdate: editAporteData.date,
        valueHistory: recalculatedHistory
      };

      setInvestments(investments.map(inv => 
        inv.id === investmentId ? updatedInvestment : inv
      ));

      setShowEditAporteModal(false);
      setEditingAporte(null);
      setEditAporteData({
        date: '',
        amount: '',
        note: ''
      });
      setSuccess(`Aporte editado com sucesso! Valor atualizado para R$ ${parseFloat(editAporteData.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      
    } catch (error) {
      console.error('Erro ao editar aporte:', error);
      setError('Erro ao editar aporte. Tente novamente.');
    }
  };

  // Abrir modal de edição de aporte
  const openEditAporteModal = (investmentId, aporteEntry) => {
    console.log('Abrindo modal para editar aporte:', aporteEntry); // Debug
    
    // Extrair valor do aporte de forma mais robusta
    let amount = '0';
    let note = '';
    
    if (aporteEntry.note && aporteEntry.note.includes('Aporte:')) {
      // Tentar extrair o valor do aporte
      const match = aporteEntry.note.match(/Aporte: \+R\$ ([\d,]+\.?\d*)/);
      if (match) {
        amount = match[1].replace(',', '');
      }
      
      // Extrair a observação (parte após o hífen)
      const parts = aporteEntry.note.split(' - ');
      if (parts.length > 1) {
        note = parts.slice(1).join(' - ');
      }
    }
    
    setEditingAporte({ investmentId, entry: aporteEntry });
    setEditAporteData({
      date: aporteEntry.date,
      amount: amount,
      note: note
    });
    setShowEditAporteModal(true);
  };

  // Calcular estatísticas avançadas
  const getAdvancedStatistics = (investmentId) => {
    const investment = investments.find(inv => inv.id === investmentId);
    if (!investment || !investment.valueHistory) return null;

    const history = investment.valueHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    const initialValue = investment.initialValue;
    const currentValue = investment.currentValue;
    
    // Calcular total de aportes
    let totalAportes = 0;
    let totalRendimentos = 0;
    
    for (let i = 1; i < history.length; i++) {
      const current = history[i];
      const previous = history[i - 1];
      const variation = current.value - previous.value;
      
      if (variation > 0) {
        // Se o valor aumentou, pode ser aporte ou rendimento
        if (current.note.includes('Aporte:')) {
          totalAportes += variation;
        } else {
          totalRendimentos += variation;
        }
      } else {
        // Se o valor diminuiu, é perda
        totalRendimentos += variation;
      }
    }

    const totalInvestido = initialValue + totalAportes;
    const rendimentoTotal = currentValue - totalInvestido;
    const roiTotal = totalInvestido > 0 ? (rendimentoTotal / totalInvestido) * 100 : 0;
    const roiSimples = initialValue > 0 ? ((currentValue - initialValue) / initialValue) * 100 : 0;

    return {
      initialValue,
      currentValue,
      totalAportes,
      totalRendimentos,
      totalInvestido,
      rendimentoTotal,
      roiTotal,
      roiSimples
    };
  };

  // Filtrar investimentos
  const filteredInvestments = investments.filter(inv => {
    const typeMatch = selectedType === 'all' || inv.type === selectedType;
    const statusMatch = selectedStatus === 'all' || inv.status === selectedStatus;
    return typeMatch && statusMatch;
  });

  // Calcular estatísticas
  const getStatistics = () => {
    const activeInvestments = investments.filter(inv => inv.status === 'active');
    const totalInitial = activeInvestments.reduce((sum, inv) => sum + inv.initialValue, 0);
    const totalCurrent = activeInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalReturn = totalCurrent - totalInitial;
    const roi = totalInitial > 0 ? (totalReturn / totalInitial) * 100 : 0;

    return {
      totalInvestments: activeInvestments.length,
      totalInitial,
      totalCurrent,
      totalReturn,
      roi
    };
  };

  // Formatar valor monetário
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar percentual
  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  // Formatar data
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const stats = getStatistics();

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      <div className="card">
        <div className="dashboard-header">
          <h1 className="dashboard-title">💰 Histórico de Investimentos</h1>
          <p>Acompanhe e gerencie todos os seus investimentos em um só lugar</p>
        </div>

        {/* Resumo dos Investimentos */}
        <div className="financial-summary" style={{ marginBottom: '30px' }}>
          <h3>📊 Resumo dos Investimentos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                {stats.totalInvestments}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Total de Investimentos</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {formatCurrency(stats.totalInitial)}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Total Investido</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {formatCurrency(stats.totalCurrent)}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Valor Atual</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: stats.totalReturn >= 0 ? 'var(--success-color)' : 'var(--error-color)' 
              }}>
                {formatCurrency(stats.totalReturn)}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Resultado</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: stats.roi >= 0 ? 'var(--success-color)' : 'var(--error-color)' 
              }}>
                {formatPercentage(stats.roi)}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>ROI Total</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="filters" style={{ marginBottom: '30px' }}>
          <h3>🔍 Filtros</h3>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }} className="filter-controls">
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-primary)' }}>
                Tipo de Investimento:
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid var(--border-color)' }}
              >
                <option value="all">Todos os Tipos</option>
                {investmentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-primary)' }}>
                Status:
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid var(--border-color)' }}
              >
                <option value="all">Todos os Status</option>
                {investmentStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabs de Navegação */}
        <div className="settings-tabs">
          <button 
            className={`tab-button ${activeTab === 'investments' ? 'active' : ''}`}
            onClick={() => setActiveTab('investments')}
          >
            📊 Histórico de Investimentos
          </button>
          <button 
            className={`tab-button ${activeTab === 'new-investment' ? 'active' : ''}`}
            onClick={() => setActiveTab('new-investment')}
          >
            ➕ Novo Investimento
          </button>
          <button 
            className={`tab-button ${activeTab === 'temporal-history' ? 'active' : ''}`}
            onClick={() => setActiveTab('temporal-history')}
          >
            📅 Histórico Temporal
          </button>
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'investments' && (
          <div className="tab-content">
            <h3>📊 Histórico de Investimentos</h3>
            <p>Visualize todos os seus investimentos e acompanhe seu desempenho.</p>
            
            {filteredInvestments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <p>Nenhum investimento encontrado com os filtros selecionados.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Tipo</th>
                      <th>Valor Inicial</th>
                      <th>Valor Atual</th>
                      <th>Resultado</th>
                      <th>ROI</th>
                      <th>Data Compra</th>
                      <th>Status</th>
                      <th>Última Atualização</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvestments.map(investment => {
                      const returnValue = investment.currentValue - investment.initialValue;
                      const roi = (returnValue / investment.initialValue) * 100;
                      const typeInfo = investmentTypes.find(t => t.value === investment.type);
                      const statusInfo = investmentStatuses.find(s => s.value === investment.status);
                      
                      return (
                        <tr key={investment.id}>
                          <td>
                            <strong>{investment.name}</strong>
                            {investment.description && (
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                {investment.description}
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div 
                                style={{ 
                                  width: '12px', 
                                  height: '12px', 
                                  backgroundColor: typeInfo?.color || '#6C757D', 
                                  borderRadius: '50%' 
                                }}
                              />
                              {typeInfo?.label.split(' ')[1]}
                            </div>
                          </td>
                          <td>{formatCurrency(investment.initialValue)}</td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              value={investment.currentValue}
                              onChange={(e) => updateInvestmentValue(investment.id, e.target.value)}
                              style={{
                                width: '100px',
                                padding: '4px 8px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                fontSize: '14px'
                              }}
                            />
                          </td>
                          <td>
                            <span style={{ 
                              color: returnValue >= 0 ? 'var(--success-color)' : 'var(--error-color)',
                              fontWeight: 'bold'
                            }}>
                              {formatCurrency(returnValue)}
                            </span>
                          </td>
                          <td>
                            <span style={{ 
                              color: roi >= 0 ? 'var(--success-color)' : 'var(--error-color)',
                              fontWeight: 'bold'
                            }}>
                              {formatPercentage(roi)}
                            </span>
                          </td>
                          <td>{formatDate(investment.purchaseDate)}</td>
                          <td>
                            <select
                              value={investment.status}
                              onChange={(e) => changeInvestmentStatus(investment.id, e.target.value)}
                              style={{
                                padding: '4px 8px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                fontSize: '12px',
                                backgroundColor: 'transparent',
                                color: statusInfo?.color || 'var(--text-primary)'
                              }}
                            >
                              {investmentStatuses.map(status => (
                                <option key={status.value} value={status.value}>
                                  {status.label.split(' ')[1]}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>{formatDate(investment.lastUpdate)}</td>
                          <td>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '5px 10px', fontSize: '12px' }}
                              onClick={() => deleteInvestment(investment.id)}
                            >
                              Excluir
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'new-investment' && (
          <div className="tab-content">
            <h3>➕ Novo Investimento</h3>
            <p>Registre um novo investimento no seu portfólio.</p>
            
            <div className="add-form">
              <form onSubmit={addInvestment}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }} className="form-grid">
                  <div className="form-group">
                    <label>📝 Nome do Investimento:</label>
                    <input
                      type="text"
                      value={newInvestment.name}
                      onChange={(e) => setNewInvestment({...newInvestment, name: e.target.value})}
                      placeholder="Ex: Ações Petrobras, CDB Banco Inter..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>🏷️ Tipo:</label>
                    <select
                      value={newInvestment.type}
                      onChange={(e) => setNewInvestment({...newInvestment, type: e.target.value})}
                      required
                    >
                      {investmentTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>💰 Valor Inicial (R$):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newInvestment.initialValue}
                      onChange={(e) => setNewInvestment({...newInvestment, initialValue: e.target.value})}
                      placeholder="0,00"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>📊 Valor Atual (R$):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newInvestment.currentValue}
                      onChange={(e) => setNewInvestment({...newInvestment, currentValue: e.target.value})}
                      placeholder="0,00"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>📅 Data de Compra:</label>
                    <input
                      type="date"
                      value={newInvestment.purchaseDate}
                      onChange={(e) => setNewInvestment({...newInvestment, purchaseDate: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>📋 Status:</label>
                    <select
                      value={newInvestment.status}
                      onChange={(e) => setNewInvestment({...newInvestment, status: e.target.value})}
                      required
                    >
                      {investmentStatuses.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label>📝 Descrição (opcional):</label>
                  <textarea
                    value={newInvestment.description}
                    onChange={(e) => setNewInvestment({...newInvestment, description: e.target.value})}
                    placeholder="Detalhes sobre o investimento, estratégia, etc..."
                    rows="3"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginTop: '20px' }} className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Adicionando...' : '➕ Adicionar Investimento'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'temporal-history' && (
          <div className="tab-content">
            <h3>📅 Histórico Temporal</h3>
            <p>Gerencie o histórico de valores dos seus investimentos ao longo do tempo.</p>
            
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-primary)', fontWeight: '500' }}>
                Selecione um Investimento:
              </label>
              <select
                value={selectedInvestment || ''}
                onChange={(e) => setSelectedInvestment(e.target.value ? parseInt(e.target.value) : null)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', minWidth: '300px' }}
                className="investment-selector"
              >
                <option value="">Escolha um investimento...</option>
                {investments.filter(inv => inv.status === 'active').map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {inv.name} - {formatCurrency(inv.currentValue)}
                  </option>
                ))}
              </select>
            </div>

            {selectedInvestment && (
              <div>
                {/* Estatísticas Avançadas */}
                {(() => {
                  const stats = getAdvancedStatistics(selectedInvestment);
                  if (!stats) return null;
                  
                  return (
                    <div className="financial-summary advanced-stats" style={{ marginBottom: '30px' }}>
                      <h4 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>📊 Estatísticas Avançadas</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            {formatCurrency(stats.initialValue)}
                          </div>
                          <div style={{ color: 'var(--text-secondary)' }}>Valor Inicial</div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                            {formatCurrency(stats.totalAportes)}
                          </div>
                          <div style={{ color: 'var(--text-secondary)' }}>Total Aportes</div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            {formatCurrency(stats.totalInvestido)}
                          </div>
                          <div style={{ color: 'var(--text-secondary)' }}>Total Investido</div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            {formatCurrency(stats.currentValue)}
                          </div>
                          <div style={{ color: 'var(--text-secondary)' }}>Valor Atual</div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ 
                            fontSize: '20px', 
                            fontWeight: 'bold', 
                            color: stats.rendimentoTotal >= 0 ? 'var(--success-color)' : 'var(--error-color)' 
                          }}>
                            {formatCurrency(stats.rendimentoTotal)}
                          </div>
                          <div style={{ color: 'var(--text-secondary)' }}>Rendimento Total</div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ 
                            fontSize: '20px', 
                            fontWeight: 'bold', 
                            color: stats.roiTotal >= 0 ? 'var(--success-color)' : 'var(--success-color)' 
                          }}>
                            {formatPercentage(stats.roiTotal)}
                          </div>
                          <div style={{ color: 'var(--text-secondary)' }}>ROI Total</div>
                        </div>
                      </div>
                      
                      {/* Botões de Ação */}
                      <div style={{ 
                        display: 'flex', 
                        gap: '15px', 
                        marginTop: '20px', 
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                      }} className="investment-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            setSelectedInvestmentForOperation(selectedInvestment);
                            setShowAporteModal(true);
                          }}
                        >
                          💰 Novo Aporte
                        </button>
                        
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setSelectedInvestmentForOperation(selectedInvestment);
                            setShowRendimentoModal(true);
                          }}
                        >
                          📈 Registrar Rendimento
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Gráfico Simples do Histórico */}
                <div style={{ 
                  background: 'var(--bg-secondary)', 
                  padding: '20px', 
                  borderRadius: '12px', 
                  marginBottom: '20px',
                  border: '1px solid var(--border-color)'
                }} className="investment-chart">
                  <h4 style={{ marginBottom: '15px', color: 'var(--text-primary)' }}>📈 Evolução do Valor</h4>
                  <div style={{ 
                    height: '200px', 
                    display: 'flex', 
                    alignItems: 'end', 
                    gap: '2px',
                    padding: '20px 0',
                    borderBottom: '2px solid var(--border-color)',
                    borderLeft: '2px solid var(--border-color)',
                    position: 'relative'
                  }} className="chart-bars">
                    {(() => {
                      const investment = investments.find(inv => inv.id === selectedInvestment);
                      if (!investment || !investment.valueHistory || investment.valueHistory.length < 2) {
                        return <div style={{ textAlign: 'center', width: '100%', color: 'var(--text-secondary)' }}>
                          Histórico insuficiente para exibir gráfico
                        </div>;
                      }

                      const history = investment.valueHistory.sort((a, b) => new Date(a.date) - new Date(a.date));
                      const minValue = Math.min(...history.map(h => h.value));
                      const maxValue = Math.max(...history.map(h => h.value));
                      const range = maxValue - minValue;
                      const maxHeight = 160;

                      return history.map((entry, index) => {
                        const height = range > 0 ? ((entry.value - minValue) / range) * maxHeight : maxHeight / 2;
                        const width = Math.max(20, 400 / history.length);
                        
                        return (
                          <div key={entry.date} style={{ 
                            width: `${width}px`,
                            height: `${height}px`,
                            background: 'linear-gradient(135deg, var(--accent-color), var(--success-color))',
                            borderRadius: '4px 4px 0 0',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'end'
                          }} className="chart-bar">
                            <div style={{ 
                              position: 'absolute', 
                              top: '-25px', 
                              fontSize: '10px', 
                              color: 'var(--text-secondary)',
                              transform: 'rotate(-45deg)',
                              whiteSpace: 'nowrap'
                            }} className="chart-value">
                              {formatCurrency(entry.value)}
                            </div>
                            <div style={{ 
                              position: 'absolute', 
                              bottom: '-20px', 
                              fontSize: '10px', 
                              color: 'var(--text-secondary)',
                              transform: 'rotate(-45deg)',
                              whiteSpace: 'nowrap'
                            }} className="chart-date">
                              {formatDate(entry.date)}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Formulário para adicionar entrada no histórico */}
                <div className="add-form">
                  <h4 style={{ marginBottom: '15px', color: 'var(--text-primary)' }}>➕ Adicionar Entrada no Histórico</h4>
                  <form onSubmit={(e) => { e.preventDefault(); addHistoryEntry(selectedInvestment); }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }} className="form-grid">
                      <div className="form-group">
                        <label>📅 Data:</label>
                        <input
                          type="date"
                          value={newHistoryEntry.date}
                          onChange={(e) => setNewHistoryEntry({...newHistoryEntry, date: e.target.value})}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>💰 Valor (R$):</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={newHistoryEntry.value}
                          onChange={(e) => setNewHistoryEntry({...newHistoryEntry, value: e.target.value})}
                          placeholder="0,00"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>📝 Observação:</label>
                        <input
                          type="text"
                          value={newHistoryEntry.note}
                          onChange={(e) => setNewHistoryEntry({...newHistoryEntry, note: e.target.value})}
                          placeholder="Ex: Atualização, evento, etc..."
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: '20px' }} className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        ➕ Adicionar ao Histórico
                      </button>
                    </div>
                  </form>
                </div>

                {/* Tabela do histórico */}
                <div style={{ marginTop: '30px' }}>
                  <h4 style={{ marginBottom: '15px', color: 'var(--text-primary)' }}>📋 Histórico Completo</h4>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Valor</th>
                          <th>Variação</th>
                          <th>Observação</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const investment = investments.find(inv => inv.id === selectedInvestment);
                          if (!investment || !investment.valueHistory) return [];

                          const history = investment.valueHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
                          
                          return history.map((entry, index) => {
                            const prevEntry = history[index + 1];
                            const variation = prevEntry ? entry.value - prevEntry.value : 0;
                            const variationPercent = prevEntry ? (variation / prevEntry.value) * 100 : 0;

                            return (
                              <tr key={entry.date}>
                                <td>{formatDate(entry.date)}</td>
                                <td style={{ fontWeight: 'bold' }}>{formatCurrency(entry.value)}</td>
                                <td>
                                  {prevEntry && (
                                    <span style={{ 
                                      color: variation >= 0 ? 'var(--success-color)' : 'var(--error-color)',
                                      fontWeight: 'bold'
                                    }}>
                                      {variation >= 0 ? '+' : ''}{formatCurrency(variation)} ({variation >= 0 ? '+' : ''}{formatPercentage(variationPercent)})
                                    </span>
                                  )}
                                </td>
                                <td>{entry.note}</td>
                                <td>
                                  {index > 0 && (
                                    <div style={{ display: 'flex', gap: '5px' }} className="table-actions">
                                      {entry.note && entry.note.includes('Aporte:') && (
                                        <button
                                          className="btn btn-secondary"
                                          style={{ padding: '5px 10px', fontSize: '12px' }}
                                          onClick={() => openEditAporteModal(selectedInvestment, entry)}
                                        >
                                          ✏️ Editar
                                        </button>
                                      )}
                                      <button
                                        className="btn btn-danger"
                                        style={{ padding: '5px 10px', fontSize: '12px' }}
                                        onClick={() => deleteHistoryEntry(selectedInvestment, entry.date)}
                                      >
                                        Excluir
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modais para Aporte e Rendimento */}
        {showAporteModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'var(--card-bg)',
              padding: '30px',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }} className="investment-modal">
              <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>💰 Novo Aporte</h3>
              
              <form onSubmit={(e) => { e.preventDefault(); addAporte(selectedInvestmentForOperation); }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }} className="form-grid">
                  <div className="form-group">
                    <label>📅 Data do Aporte:</label>
                    <input
                      type="date"
                      value={newAporte.date}
                      onChange={(e) => setNewAporte({...newAporte, date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>💰 Valor do Aporte (R$):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={newAporte.amount}
                      onChange={(e) => setNewAporte({...newAporte, amount: e.target.value})}
                      placeholder="0,00"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>📝 Observação (opcional):</label>
                    <input
                      type="text"
                      value={newAporte.note}
                      onChange={(e) => setNewAporte({...newAporte, note: e.target.value})}
                      placeholder="Ex: Aporte mensal, bônus, etc..."
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }} className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    💰 Adicionar Aporte
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowAporteModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showRendimentoModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'var(--card-bg)',
              padding: '30px',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }} className="investment-modal">
              <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>📈 Registrar Rendimento</h3>
              
              <form onSubmit={(e) => { e.preventDefault(); addRendimento(selectedInvestmentForOperation); }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }} className="form-grid">
                  <div className="form-group">
                    <label>📅 Data do Rendimento:</label>
                    <input
                      type="date"
                      value={newRendimento.date}
                      onChange={(e) => setNewRendimento({...newRendimento, date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>📊 Percentual de Rendimento (%):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newRendimento.percentage}
                      onChange={(e) => setNewRendimento({...newRendimento, percentage: e.target.value})}
                      placeholder="Ex: 5.25 para 5,25% ou -2.10 para -2,10%"
                      required
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      Use valores positivos para ganhos e negativos para perdas
                    </small>
                  </div>

                  <div className="form-group">
                    <label>📝 Observação (opcional):</label>
                    <input
                      type="text"
                      value={newRendimento.note}
                      onChange={(e) => setNewRendimento({...newRendimento, note: e.target.value})}
                      placeholder="Ex: Dividendos, variação de mercado, etc..."
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }} className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    📈 Registrar Rendimento
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowRendimentoModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modais para Edição de Aportes */}
        {showEditAporteModal && editingAporte && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'var(--card-bg)',
              padding: '30px',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }} className="investment-modal">
              <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>📝 Editar Aporte</h3>
              
              <form onSubmit={(e) => { e.preventDefault(); editAporte(editingAporte.investmentId, editingAporte.entry); }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }} className="form-grid">
                  <div className="form-group">
                    <label>📅 Data do Aporte:</label>
                    <input
                      type="date"
                      value={editAporteData.date}
                      onChange={(e) => setEditAporteData({...editAporteData, date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>💰 Valor do Aporte (R$):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={editAporteData.amount}
                      onChange={(e) => setEditAporteData({...editAporteData, amount: e.target.value})}
                      placeholder="0,00"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>📝 Observação (opcional):</label>
                    <input
                      type="text"
                      value={editAporteData.note}
                      onChange={(e) => setEditAporteData({...editAporteData, note: e.target.value})}
                      placeholder="Ex: Aporte mensal, bônus, etc..."
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }} className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    📝 Salvar Edição
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowEditAporteModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Mensagens de erro e sucesso */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>
    </div>
  );
}

export default Investments;
