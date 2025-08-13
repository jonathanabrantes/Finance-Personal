import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function BankTransactions() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [categoryGroups, setCategoryGroups] = useState([]);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Debug: verificar usuário atual
  console.log('👤 Usuário atual:', currentUser);
  console.log('🔐 Status de autenticação:', !!currentUser);
  
  // Estados para nova transação
  const [newTransaction, setNewTransaction] = useState({
    bank_account: '',
    category_group: '',
    transaction_type: 'expense',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  // Estados para filtros
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedAccount, setSelectedAccount] = useState('all');

  // Gerar lista de meses para o filtro (últimos 12 meses)
  const generateMonthOptions = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      months.push({ value, label });
    }
    
    return months;
  };

  // Carregar dados
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Iniciando carregamento de dados...');
      
      // Carregar contas bancárias
      console.log('🏦 Carregando contas bancárias...');
      const accountsResponse = await axios.get('/api/accounts/bank-accounts/');
      console.log('✅ Contas bancárias carregadas:', accountsResponse.data);
      setBankAccounts(accountsResponse.data);
      
      // Carregar grupos de categorias
      console.log('🏷️ Carregando grupos de categorias...');
      const groupsResponse = await axios.get('/api/accounts/category-groups/');
      console.log('✅ Grupos de categorias carregados:', groupsResponse.data);
      console.log('🔍 Estrutura dos grupos de categoria:', groupsResponse.data.map(g => ({
        id: g.id,
        name: g.name,
        transaction_type: g.transaction_type
      })));
      setCategoryGroups(groupsResponse.data);
      
      // Carregar transações do mês selecionado
      console.log('💰 Carregando transações...');
      const transactionsResponse = await axios.get(`/api/accounts/transactions/?month_year=${selectedMonth}`);
      console.log('✅ Transações carregadas:', transactionsResponse.data);
      setTransactions(transactionsResponse.data);
      
      // Carregar resumo financeiro
      console.log('📊 Carregando resumo financeiro...');
      const summaryResponse = await axios.get(`/api/accounts/financial-summary/?month_year=${selectedMonth}`);
      console.log('✅ Resumo financeiro carregado:', summaryResponse.data);
      setFinancialSummary(summaryResponse.data);
      
      console.log('🎉 Todos os dados foram carregados com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro detalhado ao carregar dados:', error);
      console.error('❌ Resposta do servidor:', error.response);
      console.error('❌ Status HTTP:', error.response?.status);
      console.error('❌ Dados da resposta:', error.response?.data);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calcular dados para o gráfico de pizza de gastos por categoria
  const getExpensesByCategory = () => {
    if (!transactions || !categoryGroups) return [];
    
    // Filtrar apenas transações de despesa
    const expenses = transactions.filter(t => t.transaction_type === 'expense');
    
    // Agrupar despesas por categoria
    const expensesByCategory = {};
    
    expenses.forEach(expense => {
      const category = categoryGroups.find(cg => cg.id === expense.category_group);
      if (category) {
        const categoryName = category.name;
        if (expensesByCategory[categoryName]) {
          expensesByCategory[categoryName] += parseFloat(expense.amount);
        } else {
          expensesByCategory[categoryName] = parseFloat(expense.amount);
        }
      }
    });
    
    // Calcular total de despesas
    const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
    
    // Converter para array com percentuais e cores
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    
    return Object.entries(expensesByCategory).map(([category, amount], index) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      color: colors[index % colors.length]
    })).sort((a, b) => b.amount - a.amount); // Ordenar por valor decrescente
  };

  // Adicionar nova transação
  const addTransaction = async (e) => {
    e.preventDefault();
    
    console.log('📝 Tentando adicionar transação:', newTransaction);
    console.log('🏷️ Categorias disponíveis:', categoryGroups);
    console.log('🏦 Contas disponíveis:', bankAccounts);
    
    // Validação dos campos
    if (!newTransaction.bank_account) {
      setError('Selecione uma conta bancária');
      return;
    }
    
    if (!newTransaction.category_group) {
      setError('Selecione uma categoria');
      return;
    }
    
    if (!newTransaction.amount || parseFloat(newTransaction.amount) <= 0) {
      setError('Valor deve ser maior que zero');
      return;
    }
    
    if (!newTransaction.description || newTransaction.description.trim() === '') {
      setError('Descrição é obrigatória');
      return;
    }

    try {
      setLoading(true);
      
      // Encontrar o grupo de categoria para determinar o tipo de transação
      const categoryGroup = categoryGroups.find(g => g.id === parseInt(newTransaction.category_group));
      
      console.log('🔍 Categoria encontrada:', categoryGroup);
      
      if (!categoryGroup) {
        setError('Categoria não encontrada. Tente novamente.');
        return;
      }
      
      if (!categoryGroup.transaction_type) {
        setError('Categoria sem tipo de transação definido');
        return;
      }
      
      const transactionData = {
        ...newTransaction,
        transaction_type: categoryGroup.transaction_type,
        amount: parseFloat(newTransaction.amount),
        category_group: parseInt(newTransaction.category_group),
        bank_account: parseInt(newTransaction.bank_account)
      };

      console.log('📤 Enviando transação:', transactionData);
      
      await axios.post('/api/accounts/transactions/', transactionData);
      
      setSuccess('Transação adicionada com sucesso!');
      setNewTransaction({
        bank_account: '',
        category_group: '',
        transaction_type: 'expense',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0]
      });
      
      // Recarregar dados
      await loadData();
      
    } catch (error) {
      console.error('❌ Erro detalhado ao adicionar transação:', error);
      if (error.response) {
        console.error('📡 Resposta do servidor:', error.response.data);
        setError(`Erro do servidor: ${error.response.data.message || error.response.data.error || 'Erro desconhecido'}`);
      } else if (error.request) {
        setError('Erro de conexão. Verifique sua internet.');
      } else {
        setError('Erro ao adicionar transação. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Excluir transação
  const deleteTransaction = async (transactionId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta transação?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`/api/accounts/transactions/${transactionId}/`);
      setSuccess('Transação excluída com sucesso!');
      await loadData();
    } catch (error) {
      setError('Erro ao excluir transação');
      console.error('Erro ao excluir transação:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar transações por conta bancária
  const filteredTransactions = selectedAccount === 'all' 
    ? transactions 
    : transactions.filter(t => t.bank_account === selectedAccount);

  // Formatar valor monetário
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Exportar dados para CSV
  const exportToCSV = () => {
    if (!transactions || transactions.length === 0) {
      setError('Não há transações para exportar');
      return;
    }

    try {
      const headers = ['Data', 'Conta', 'Categoria', 'Tipo', 'Valor', 'Descrição'];
      const csvData = transactions.map(t => [
        new Date(t.transaction_date).toLocaleDateString('pt-BR'),
        bankAccounts.find(acc => acc.id === t.bank_account)?.name || 'N/A',
        categoryGroups.find(cg => cg.id === t.category_group)?.name || 'N/A',
        t.transaction_type === 'expense' ? 'Despesa' : 'Receita',
        formatCurrency(t.amount),
        t.description
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `transacoes_${selectedMonth}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess('Dados exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      setError('Erro ao exportar dados');
    }
  };

  // Calcular estatísticas adicionais
  const getTransactionStats = () => {
    if (!transactions || transactions.length === 0) return null;

    const totalTransactions = transactions.length;
    const expenses = transactions.filter(t => t.transaction_type === 'expense');
    const incomes = transactions.filter(t => t.transaction_type === 'income');
    
    const avgExpense = expenses.length > 0 
      ? expenses.reduce((sum, t) => sum + parseFloat(t.amount), 0) / expenses.length 
      : 0;
    
    const avgIncome = incomes.length > 0 
      ? incomes.reduce((sum, t) => sum + parseFloat(t.amount), 0) / incomes.length 
      : 0;

    return {
      totalTransactions,
      totalExpenses: expenses.length,
      totalIncomes: incomes.length,
      avgExpense,
      avgIncome
    };
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '20px' }}>
        <div className="card text-center">
          <p>Carregando movimentações bancárias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '20px' }}>
      <div className="card">
        <div className="dashboard-header">
          <h1 className="dashboard-title">🏦 Movimentações Bancárias</h1>
          <p className="dashboard-subtitle">Controle suas receitas, despesas e saldos bancários</p>
        </div>

        {/* Resumo Financeiro */}
        {financialSummary && (
          <div className="financial-summary">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3>📊 Resumo do Mês</h3>
              <button 
                onClick={exportToCSV}
                className="btn btn-secondary"
                style={{ fontSize: '14px', padding: '8px 16px' }}
                title="Exportar transações para CSV"
              >
                📥 Exportar CSV
              </button>
            </div>
            <div className="grid">
              <div className="stat-item">
                <div className="stat-value" style={{ color: 'var(--success-color)' }}>
                  {formatCurrency(financialSummary.total_income)}
                </div>
                <div className="stat-label">Total de Receitas</div>
              </div>
              <div className="stat-item">
                <div className="stat-value" style={{ color: 'var(--error-color)' }}>
                  {formatCurrency(financialSummary.total_expense)}
                </div>
                <div className="stat-label">Total de Despesas</div>
              </div>
              <div className="stat-item">
                <div className="stat-value" style={{ 
                  color: financialSummary.balance >= 0 ? 'var(--success-color)' : 'var(--error-color)' 
                }}>
                  {formatCurrency(financialSummary.balance)}
                </div>
                <div className="stat-label">Saldo do Mês</div>
              </div>
              <div className="stat-item">
                <div className="stat-value" style={{ color: 'var(--accent-color)' }}>
                  {financialSummary.transaction_count}
                </div>
                <div className="stat-label">Total de Transações</div>
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas Adicionais */}
        {getTransactionStats() && (
          <div className="transaction-stats">
            <h3>📈 Estatísticas do Mês</h3>
            <div className="grid">
              <div className="stat-item">
                <div className="stat-value" style={{ color: 'var(--accent-color)' }}>
                  {getTransactionStats().totalTransactions}
                </div>
                <div className="stat-label">Total de Transações</div>
              </div>
              <div className="stat-item">
                <div className="stat-value" style={{ color: 'var(--error-color)' }}>
                  {getTransactionStats().totalExpenses}
                </div>
                <div className="stat-label">Transações de Despesa</div>
              </div>
              <div className="stat-item">
                <div className="stat-value" style={{ color: 'var(--success-color)' }}>
                  {getTransactionStats().totalIncomes}
                </div>
                <div className="stat-label">Transações de Receita</div>
              </div>
              <div className="stat-item">
                <div className="stat-value" style={{ color: 'var(--warning-color)' }}>
                  {formatCurrency(getTransactionStats().avgExpense)}
                </div>
                <div className="stat-label">Média de Despesas</div>
              </div>
              <div className="stat-item">
                <div className="stat-value" style={{ color: 'var(--info-color)' }}>
                  {formatCurrency(getTransactionStats().avgIncome)}
                </div>
                <div className="stat-label">Média de Receitas</div>
              </div>
            </div>
          </div>
        )}

        {/* Gráfico de Pizza - Gastos por Categoria */}
        {(() => {
          const expensesData = getExpensesByCategory();
          if (expensesData.length === 0) return null;
          
          return (
            <div className="expenses-chart">
              <h3>
                🥧 Gastos por Categoria - {new Date(selectedMonth + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: 'var(--spacing-xl)',
                alignItems: 'center'
              }}>
                {/* Gráfico de Pizza */}
                <div className="pie-chart-container">
                  <div className="pie-chart" style={{ 
                    background: 'conic-gradient(' + 
                      expensesData.map((item, index) => {
                        const startAngle = expensesData
                          .slice(0, index)
                          .reduce((sum, _, i) => sum + (expensesData[i].percentage * 3.6), 0);
                        const endAngle = startAngle + (item.percentage * 3.6);
                        return `${item.color} ${startAngle}deg ${endAngle}deg`;
                      }).join(', ') + 
                    ')'
                  }}>
                    {/* Centro do gráfico */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '80px',
                      height: '80px',
                      background: 'var(--card-bg)',
                      borderRadius: '50%',
                      border: '3px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-primary)',
                      fontWeight: 'bold',
                      fontSize: '1.2rem'
                    }}>
                      {expensesData.length}
                    </div>
                  </div>
                </div>
                
                {/* Legenda e Estatísticas */}
                <div className="chart-legend">
                  {expensesData.map((item, index) => (
                    <div key={index} className="legend-item">
                      {/* Indicador de cor */}
                      <div className="color-indicator" style={{ backgroundColor: item.color }}></div>
                      
                      {/* Texto da legenda */}
                      <div className="legend-text">{item.category}</div>
                      
                      {/* Percentual */}
                      <div className="legend-percentage">
                        {item.percentage.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Filtros */}
        <div className="card-header">
          <h3 className="card-title">🔍 Filtros</h3>
          <p className="card-subtitle">Configure os filtros para visualizar suas transações</p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-xl)'
        }}>
          <div className="form-group">
            <label>Mês/Ano:</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="form-control"
            >
              {generateMonthOptions().map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Conta Bancária:</label>
            <select 
              value={selectedAccount} 
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="form-control"
            >
              <option value="all">Todas as Contas</option>
              {bankAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name} - {formatCurrency(account.balance)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            ✨ Nova Transação
          </button>
          <button 
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📋 Histórico de Transações
          </button>
        </div>

        {/* Nova Transação */}
        {activeTab === 'new' && (
          <div className="animate-slide-up">
            <div className="card-header">
              <h3 className="card-title">+ Nova Transação</h3>
              <p className="card-subtitle">Adicione uma nova movimentação bancária ao seu histórico</p>
            </div>

            <form onSubmit={addTransaction} className="form-grid">
              <div className="form-group">
                <label>CONTA BANCÁRIA:</label>
                <select 
                  value={newTransaction.bank_account} 
                  onChange={(e) => setNewTransaction({...newTransaction, bank_account: e.target.value})}
                  required
                  className="form-control"
                >
                  <option value="">Selecione uma conta</option>
                  {bankAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {formatCurrency(account.balance)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>GRUPO DE CATEGORIA:</label>
                <select 
                  value={newTransaction.category_group} 
                  onChange={(e) => setNewTransaction({...newTransaction, category_group: e.target.value})}
                  required
                  className="form-control"
                >
                  <option value="">Selecione uma categoria</option>
                  {categoryGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.transaction_type === 'expense' ? 'Despesa' : 'Receita'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>VALOR:</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={newTransaction.amount} 
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  placeholder="0,00"
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>DATA DA TRANSAÇÃO:</label>
                <input 
                  type="date" 
                  value={newTransaction.transaction_date} 
                  onChange={(e) => setNewTransaction({...newTransaction, transaction_date: e.target.value})}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>DESCRIÇÃO:</label>
                <input 
                  type="text" 
                  value={newTransaction.description} 
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  placeholder="Descrição da transação"
                  required
                  className="form-control"
                />
              </div>

              <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: 'var(--spacing-lg)' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Adicionando...
                    </>
                  ) : (
                    'Adicionar Transação'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Histórico de Transações */}
        {activeTab === 'history' && (
          <div className="animate-slide-up">
            <div className="card-header">
              <h3 className="card-title">📋 Histórico de Transações</h3>
              <p className="card-subtitle">Visualize e gerencie todas as suas transações</p>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="text-center" style={{ padding: 'var(--spacing-3xl)' }}>
                <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)' }}>📭</div>
                <h3 style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                  Nenhuma transação encontrada
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  Não há transações para o período e conta selecionados.
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Conta</th>
                      <th>Categoria</th>
                      <th>Tipo</th>
                      <th>Valor</th>
                      <th>Descrição</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(transaction => (
                      <tr key={transaction.id}>
                        <td>
                          {new Date(transaction.transaction_date).toLocaleDateString('pt-BR')}
                        </td>
                        <td>
                          {bankAccounts.find(acc => acc.id === transaction.bank_account)?.name || 'N/A'}
                        </td>
                        <td>
                          {categoryGroups.find(cg => cg.id === transaction.category_group)?.name || 'N/A'}
                        </td>
                        <td>
                          <span className={`badge badge-${transaction.transaction_type === 'expense' ? 'error' : 'success'}`}>
                            {transaction.transaction_type === 'expense' ? 'Despesa' : 'Receita'}
                          </span>
                        </td>
                        <td style={{ 
                          color: transaction.transaction_type === 'expense' ? 'var(--error-color)' : 'var(--success-color)',
                          fontWeight: 'bold'
                        }}>
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td>{transaction.description}</td>
                        <td>
                          <button 
                            onClick={() => deleteTransaction(transaction.id)}
                            className="btn btn-danger"
                            style={{ padding: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}
                            title="Excluir transação"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Mensagens de Feedback */}
        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            ✅ {success}
          </div>
        )}
      </div>
    </div>
  );
}

export default BankTransactions;
