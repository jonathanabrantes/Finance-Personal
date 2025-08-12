import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Settings() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('bank-accounts');
  
  // Estados para contas bancárias
  const [bankAccounts, setBankAccounts] = useState([
    { id: 1, name: 'Banco do Brasil', color: '#0066CC', active: true },
    { id: 2, name: 'Nubank', color: '#8A05BE', active: true },
    { id: 3, name: 'Itaú', color: '#EC7000', active: true }
  ]);
  const [newBankAccount, setNewBankAccount] = useState({ name: '', color: '#0066CC' });
  
  // Estados para grupos
  const [groups, setGroups] = useState({
    income: [
      { id: 1, name: 'Salário', color: '#28A745', active: true },
      { id: 2, name: 'Freelance', color: '#17A2B8', active: true },
      { id: 3, name: 'Investimentos', color: '#FFC107', active: true }
    ],
    expense: [
      { id: 1, name: 'Alimentação', color: '#DC3545', active: true },
      { id: 2, name: 'Transporte', color: '#6F42C1', active: true },
      { id: 3, name: 'Moradia', color: '#FD7E14', active: true }
    ]
  });
  const [newGroup, setNewGroup] = useState({ name: '', color: '#0066CC', type: 'income' });

  // Funções para contas bancárias
  const addBankAccount = () => {
    if (newBankAccount.name.trim()) {
      const account = {
        id: Date.now(),
        name: newBankAccount.name.trim(),
        color: newBankAccount.color,
        active: true
      };
      setBankAccounts([...bankAccounts, account]);
      setNewBankAccount({ name: '', color: '#0066CC' });
    }
  };

  const toggleBankAccountStatus = (id) => {
    setBankAccounts(bankAccounts.map(acc => 
      acc.id === id ? { ...acc, active: !acc.active } : acc
    ));
  };

  const deleteBankAccount = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta bancária?')) {
      setBankAccounts(bankAccounts.filter(acc => acc.id !== id));
    }
  };

  // Funções para grupos
  const addGroup = () => {
    if (newGroup.name.trim()) {
      const group = {
        id: Date.now(),
        name: newGroup.name.trim(),
        color: newGroup.color,
        active: true
      };
      setGroups({
        ...groups,
        [newGroup.type]: [...groups[newGroup.type], group]
      });
      setNewGroup({ name: '', color: '#0066CC', type: 'income' });
    }
  };

  const toggleGroupStatus = (id, type) => {
    setGroups({
      ...groups,
      [type]: groups[type].map(group => 
        group.id === id ? { ...group, active: !group.active } : group
      )
    });
  };

  const deleteGroup = (id, type) => {
    if (window.confirm('Tem certeza que deseja excluir este grupo?')) {
      setGroups({
        ...groups,
        [type]: groups[type].filter(group => group.id !== id)
      });
    }
  };

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      <div className="card">
        <div className="dashboard-header">
          <h1 className="dashboard-title">⚙️ Configurações Pessoais</h1>
          <p>Gerencie suas configurações e personalizações do sistema</p>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '8px 16px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            fontSize: '14px',
            marginTop: '10px'
          }}>
            <span style={{ fontSize: '18px' }}>👤</span>
            <div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                {currentUser?.first_name || currentUser?.username}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                {currentUser?.user_type === 'admin' ? 'Administrador' : 'Usuário'}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de Navegação */}
        <div className="settings-tabs">
          <button 
            className={`tab-button ${activeTab === 'bank-accounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('bank-accounts')}
          >
            🏦 Contas Bancárias
          </button>
          <button 
            className={`tab-button ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            🏷️ Grupos de Categorias
          </button>
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'bank-accounts' && (
          <div className="tab-content">
            <h3>🏦 Gerenciador de Contas Bancárias</h3>
            <p>Configure suas contas bancárias para categorização de transações financeiras.</p>
            
            {/* Formulário para adicionar conta */}
            <div className="add-form">
              <h4>➕ Adicionar Nova Conta</h4>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Nome da conta bancária"
                  value={newBankAccount.name}
                  onChange={(e) => setNewBankAccount({...newBankAccount, name: e.target.value})}
                  style={{ flex: 1, minWidth: '200px' }}
                />
                <input
                  type="color"
                  value={newBankAccount.color}
                  onChange={(e) => setNewBankAccount({...newBankAccount, color: e.target.value})}
                  style={{ width: '50px', height: '40px' }}
                />
                <button onClick={addBankAccount} className="btn btn-primary">
                  Adicionar
                </button>
              </div>
            </div>

            {/* Lista de contas bancárias */}
            <div className="items-list">
              <h4>📋 Suas Contas Bancárias</h4>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Cor</th>
                      <th>Nome da Conta</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankAccounts.map(account => (
                      <tr key={account.id}>
                        <td>
                          <div 
                            style={{ 
                              width: '20px', 
                              height: '20px', 
                              backgroundColor: account.color, 
                              borderRadius: '50%',
                              border: '2px solid var(--border-color)'
                            }}
                          />
                        </td>
                        <td>{account.name}</td>
                        <td>
                          <span className={`badge badge-${account.active ? 'active' : 'inactive'}`}>
                            {account.active ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                              className={`btn ${account.active ? 'btn-warning' : 'btn-success'}`}
                              style={{ padding: '5px 10px', fontSize: '12px' }}
                              onClick={() => toggleBankAccountStatus(account.id)}
                            >
                              {account.active ? 'Desativar' : 'Ativar'}
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '5px 10px', fontSize: '12px' }}
                              onClick={() => deleteBankAccount(account.id)}
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="tab-content">
            <h3>🏷️ Gerenciador de Grupos de Categorias</h3>
            <p>Configure seus grupos para categorização de receitas e despesas.</p>
            
            {/* Formulário para adicionar grupo */}
            <div className="add-form">
              <h4>➕ Adicionar Novo Grupo</h4>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Nome do grupo"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  style={{ flex: 1, minWidth: '200px' }}
                />
                <select
                  value={newGroup.type}
                  onChange={(e) => setNewGroup({...newGroup, type: e.target.value})}
                  style={{ minWidth: '120px' }}
                >
                  <option value="income">Receitas</option>
                  <option value="expense">Despesas</option>
                </select>
                <input
                  type="color"
                  value={newGroup.color}
                  onChange={(e) => setNewGroup({...newGroup, color: e.target.value})}
                  style={{ width: '50px', height: '40px' }}
                />
                <button onClick={addGroup} className="btn btn-primary">
                  Adicionar
                </button>
              </div>
            </div>

            {/* Grupos de Receitas */}
            <div className="groups-section">
              <h4>💰 Grupos de Receitas</h4>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Cor</th>
                      <th>Nome do Grupo</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.income.map(group => (
                      <tr key={group.id}>
                        <td>
                          <div 
                            style={{ 
                              width: '20px', 
                              height: '20px', 
                              backgroundColor: group.color, 
                              borderRadius: '50%',
                              border: '2px solid var(--border-color)'
                            }}
                          />
                        </td>
                        <td>{group.name}</td>
                        <td>
                          <span className={`badge badge-${group.active ? 'active' : 'inactive'}`}>
                            {group.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                              className={`btn ${group.active ? 'btn-warning' : 'btn-success'}`}
                              style={{ padding: '5px 10px', fontSize: '12px' }}
                              onClick={() => toggleGroupStatus(group.id, 'income')}
                            >
                              {group.active ? 'Desativar' : 'Ativar'}
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '5px 10px', fontSize: '12px' }}
                              onClick={() => deleteGroup(group.id, 'income')}
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Grupos de Despesas */}
            <div className="groups-section">
              <h4>💸 Grupos de Despesas</h4>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Cor</th>
                      <th>Nome do Grupo</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.expense.map(group => (
                      <tr key={group.id}>
                        <td>
                          <div 
                            style={{ 
                              width: '20px', 
                              height: '20px', 
                              backgroundColor: group.color, 
                              borderRadius: '50%',
                              border: '2px solid var(--border-color)'
                            }}
                          />
                        </td>
                        <td>{group.name}</td>
                        <td>
                          <span className={`badge badge-${group.active ? 'active' : 'inactive'}`}
                          >
                            {group.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                              className={`btn ${group.active ? 'btn-warning' : 'btn-success'}`}
                              style={{ padding: '5px 10px', fontSize: '12px' }}
                              onClick={() => toggleGroupStatus(group.id, 'expense')}
                            >
                              {group.active ? 'Desativar' : 'Ativar'}
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '5px 10px', fontSize: '12px' }}
                              onClick={() => deleteGroup(group.id, 'expense')}
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
