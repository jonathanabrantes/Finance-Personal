import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const { currentUser } = useAuth();

  // Formulário de edição
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    user_type: 'user',
    is_active: true
  });

  useEffect(() => {
    if (currentUser?.user_type === 'admin') {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/accounts/users/');
      setUsers(response.data);
    } catch (error) {
      setError('Erro ao carregar usuários');
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      user_type: user.user_type,
      is_active: user.is_active
    });
    setShowEditForm(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(`/api/accounts/users/${editingUser.id}/`, editForm);
      setSuccess('Usuário atualizado com sucesso!');
      setShowEditForm(false);
      setEditingUser(null);
      fetchUsers(); // Recarregar lista
    } catch (error) {
      setError('Erro ao atualizar usuário');
      console.error('Erro ao atualizar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        setLoading(true);
        await axios.delete(`/api/accounts/users/${userId}/`);
        setSuccess('Usuário excluído com sucesso!');
        fetchUsers(); // Recarregar lista
      } catch (error) {
        setError('Erro ao excluir usuário');
        console.error('Erro ao excluir usuário:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      setLoading(true);
      await axios.patch(`/api/accounts/users/${userId}/`, {
        is_active: !currentStatus
      });
      setSuccess('Status do usuário alterado com sucesso!');
      fetchUsers(); // Recarregar lista
    } catch (error) {
      setError('Erro ao alterar status do usuário');
      console.error('Erro ao alterar status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (currentUser?.user_type !== 'admin') {
    return (
      <div className="card">
        <h3>Acesso Negado</h3>
        <p>Você não tem permissão para acessar esta área.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card text-center">
        <p>Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Gerenciamento de Usuários</h2>
        <div className="dashboard-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => setShowEditForm(false)}
          >
            Adicionar Usuário
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Formulário de Edição/Adição */}
      {showEditForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>{editingUser ? 'Editar Usuário' : 'Adicionar Usuário'}</h3>
          <form onSubmit={handleUpdateUser}>
            <div className="form-group">
              <label>Usuário:</label>
              <input
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                required
                disabled={editingUser} // Não permitir editar username
              />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Nome:</label>
              <input
                type="text"
                value={editForm.first_name}
                onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Sobrenome:</label>
              <input
                type="text"
                value={editForm.last_name}
                onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Tipo de Usuário:</label>
              <select
                value={editForm.user_type}
                onChange={(e) => setEditForm({...editForm, user_type: e.target.value})}
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                />
                Usuário Ativo
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                {editingUser ? 'Atualizar' : 'Adicionar'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingUser(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Usuários */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuário</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.first_name} {user.last_name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge badge-${user.user_type}`}>
                    {user.user_type === 'admin' ? 'Admin' : 'Usuário'}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${user.is_active ? 'active' : 'inactive'}`}>
                    {user.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString('pt-BR')}</td>
                <td>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                      onClick={() => handleEditUser(user)}
                    >
                      Editar
                    </button>
                    <button
                      className={`btn ${user.is_active ? 'btn-warning' : 'btn-success'}`}
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                    >
                      {user.is_active ? 'Desativar' : 'Ativar'}
                    </button>
                    {user.id !== currentUser.id && (
                      <button
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;
