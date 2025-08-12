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
    <div className="container" style={{ paddingTop: '20px' }}>
      <div className="card">
        <div className="dashboard-header">
          <h1 className="dashboard-title">🏦 Movimentações Bancárias</h1>
          <p>Controle suas receitas, despesas e saldos bancários</p>
        </div>

        {/* Resumo Financeiro */}
        {financialSummary && (
          <div className="financial-summary" style={{ 
            background: 'var(--bg-secondary)', 
            padding: '20px', 
            borderRadius: '10px', 
            marginBottom: '30px',
            border: '1px solid var(--border-color)'
          }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--success-color)' }}>
                  {formatCurrency(financialSummary.total_income)}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>Total de Receitas</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--error-color)' }}>
                  {formatCurrency(financialSummary.total_expense)}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>Total de Despesas</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: financialSummary.balance >= 0 ? 'var(--success-color)' : 'var(--error-color)' 
                }}>
                  {formatCurrency(financialSummary.balance)}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>Saldo do Mês</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                  {financialSummary.transaction_count}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>Total de Transações</div>
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas Adicionais */}
        {getTransactionStats() && (
          <div className="transaction-stats" style={{ 
            background: 'var(--bg-tertiary)', 
            padding: '20px', 
            borderRadius: '10px', 
            marginBottom: '30px',
            border: '1px solid var(--border-color)'
          }}>
            <h3>📈 Estatísticas do Mês</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginTop: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                  {getTransactionStats().totalTransactions}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Total de Transações</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--error-color)' }}>
                  {getTransactionStats().totalExpenses}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Transações de Despesa</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--success-color)' }}>
                  {getTransactionStats().totalIncomes}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Transações de Receita</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--warning-color)' }}>
                  {formatCurrency(getTransactionStats().avgExpense)}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Média de Despesas</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--info-color)' }}>
                  {formatCurrency(getTransactionStats().avgIncome)}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Média de Receitas</div>
              </div>
            </div>
          </div>
        )}

        {/* Gráfico de Pizza - Gastos por Categoria */}
        {(() => {
          const expensesData = getExpensesByCategory();
          if (expensesData.length === 0) return null;
          
          return (
            <div className="expenses-chart" style={{ 
              background: 'var(--card-bg)', 
              padding: 'var(--spacing-xl)', 
              borderRadius: 'var(--border-radius-lg)', 
              marginBottom: 'var(--spacing-xl)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ 
                marginBottom: 'var(--spacing-lg)', 
                color: 'var(--text-primary)',
                textAlign: 'center',
                fontSize: '1.5rem',
                fontWeight: '600'
              }}>
                🥧 Gastos por Categoria - {new Date(selectedMonth + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: 'var(--spacing-xl)',
                alignItems: 'center'
              }}>
                {/* Gráfico de Pizza */}
                <div className="pie-chart-container" style={{ textAlign: 'center' }}>
                  <div className="pie-chart" style={{ 
                    width: '300px', 
                    height: '300px', 
                    margin: '0 auto',
                    position: 'relative',
                    borderRadius: '50%',
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
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr', 
                    gap: 'var(--spacing-sm)',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}>
                    {expensesData.map((item, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                        padding: 'var(--spacing-sm)',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--border-radius-md)',
                        border: '1px solid var(--border-color)',
                        transition: 'var(--transition-normal)'
                      }}>
                        {/* Indicador de cor */}
                        <div style={{
                          width: '20px',
                          height: '20px',
                          backgroundColor: item.color,
                          borderRadius: '50%',
                          border: '2px solid var(--border-color)'
                        }} />
                        
                        {/* Informações da categoria */}
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            fontSize: '0.9rem'
                          }}>
                            {item.category}
                          </div>
                          <div style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.8rem'
                          }}>
                            {item.percentage.toFixed(1)}% • {formatCurrency(item.amount)}
                          </div>
                        </div>
                        
                        {/* Percentual destacado */}
                        <div style={{
                          fontWeight: 'bold',
                          color: 'var(--text-primary)',
                          fontSize: '1.1rem',
                          minWidth: '50px',
                          textAlign: 'right'
                        }}>
                          {item.percentage.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Total de despesas */}
                  <div style={{
                    marginTop: 'var(--spacing-lg)',
                    padding: 'var(--spacing-md)',
                    background: 'var(--accent-light)',
                    borderRadius: 'var(--border-radius-md)',
                    border: '2px solid var(--accent-color)',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      color: 'var(--accent-color)'
                    }}>
                      Total de Despesas
                    </div>
                    <div style={{
                      fontSize: '1.8rem',
                      fontWeight: 'bold',
                      color: 'var(--text-primary)'
                    }}>
                      {formatCurrency(expensesData.reduce((sum, item) => sum + item.amount, 0))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Filtros */}
        <div className="filters" style={{ marginBottom: '30px' }}>
          <h3>🔍 Filtros</h3>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-primary)' }}>
                Mês/Ano:
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid var(--border-color)' }}
              >
                {generateMonthOptions().map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-primary)' }}>
                Conta Bancária:
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid var(--border-color)' }}
              >
                <option value="all">Todas as Contas</option>
                {bankAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {formatCurrency(account.current_balance)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabs de Navegação */}
        <div className="settings-tabs">
          <button 
            className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            📋 Histórico de Transações
          </button>
          <button 
            className={`tab-button ${activeTab === 'new-transaction' ? 'active' : ''}`}
            onClick={() => setActiveTab('new-transaction')}
          >
            ➕ Nova Transação
          </button>
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'transactions' && (
          <div className="tab-content">
            <h3>📋 Histórico de Transações</h3>
            <p>Visualize todas as suas movimentações bancárias do mês selecionado.</p>
            
            {filteredTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <p>Nenhuma transação encontrada para este período.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Descrição</th>
                      <th>Conta</th>
                      <th>Categoria</th>
                      <th>Valor</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(transaction => (
                      <tr key={transaction.id}>
                        <td>{transaction.formatted_date}</td>
                        <td>{transaction.description}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div 
                              style={{ 
                                width: '12px', 
                                height: '12px', 
                                backgroundColor: transaction.bank_account_color || '#0066CC', 
                                borderRadius: '50%' 
                              }}
                            />
                            {transaction.bank_account_name}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div 
                              style={{ 
                                width: '12px', 
                                height: '12px', 
                                backgroundColor: transaction.category_group_color || '#0066CC', 
                                borderRadius: '50%' 
                              }}
                            />
                            {transaction.category_group_name}
                          </div>
                        </td>
                        <td>
                          <span style={{ 
                            color: transaction.transaction_type === 'income' ? 'var(--success-color)' : 'var(--error-color)',
                            fontWeight: 'bold'
                          }}>
                            {transaction.formatted_amount}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                            onClick={() => deleteTransaction(transaction.id)}
                          >
                            Excluir
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

        {activeTab === 'new-transaction' && (
          <div className="tab-content">
            <h3>➕ Nova Transação</h3>
            <p>Adicione uma nova movimentação bancária ao seu histórico.</p>
            
            <div className="add-form">
              <form onSubmit={addTransaction}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <div className="form-group">
                    <label>Conta Bancária:</label>
                    <select
                      value={newTransaction.bank_account}
                      onChange={(e) => setNewTransaction({...newTransaction, bank_account: e.target.value})}
                      required
                    >
                      <option value="">Selecione uma conta</option>
                      {bankAccounts.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.name} - {formatCurrency(account.current_balance)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Grupo de Categoria:</label>
                    <select
                      value={newTransaction.category_group}
                      onChange={(e) => setNewTransaction({...newTransaction, category_group: e.target.value})}
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      {categoryGroups.map(group => (
                        <option key={group.id} value={group.id}>
                          {group.name} ({group.transaction_type_display})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Valor:</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                      placeholder="0,00"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Data da Transação:</label>
                    <input
                      type="date"
                      value={newTransaction.transaction_date}
                      onChange={(e) => setNewTransaction({...newTransaction, transaction_date: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label>Descrição:</label>
                  <input
                    type="text"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    placeholder="Ex: Salário, Aluguel, Supermercado..."
                    required
                  />
                </div>

                <div style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Adicionando...' : 'Adicionar Transação'}
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

export default BankTransactions;
