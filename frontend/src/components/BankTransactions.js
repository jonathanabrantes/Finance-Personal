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

  // Adicionar nova transação
  const addTransaction = async (e) => {
    e.preventDefault();
    
    if (!newTransaction.bank_account || !newTransaction.category_group || 
        !newTransaction.amount || !newTransaction.description) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    try {
      setLoading(true);
      
      // Encontrar o grupo de categoria para determinar o tipo de transação
      const categoryGroup = categoryGroups.find(g => g.id === newTransaction.category_group);
      const transactionData = {
        ...newTransaction,
        transaction_type: categoryGroup.transaction_type,
        amount: parseFloat(newTransaction.amount)
      };

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
      setError('Erro ao adicionar transação');
      console.error('Erro ao adicionar transação:', error);
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
            <h3>📊 Resumo do Mês</h3>
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
