import { Table, Space, Avatar, Select, Input, Button, Modal, message, Spin } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import height from './height';
import { useAuth } from '../context/AuthContext';
import { hasAnyRole, normalizeRole, ROLES } from '../config/accessControl';
import 'moment/locale/fr';
moment.locale('fr');

const { Column } = Table;
const { confirm } = Modal;

const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: 'Admin' },
  { value: ROLES.USER, label: 'Utilisateur' },
  { value: ROLES.INVITER, label: 'Invité' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Actif' },
  { value: 'pending', label: 'En attente' },
  { value: 'blocked', label: 'Bloqué' },
];

const getOptionLabel = (options, value) => (
  options.find(option => option.value === value)?.label || value
);

function TablePersonne() {
  const { user } = useAuth();
  const isAdmin = hasAnyRole(user, [ROLES.ADMIN]);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [avatarLoading, setAvatarLoading] = useState({}); // Suivre le chargement des avatars

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/Parametre/Administrateur/User/ajoutUtilisateur');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/crud/users');
      setData(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error('Erreur lors du fetch des données :', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };



  useEffect(() => {
    const filtered = data.filter(personne => {
      const isMatchSearch = 
        personne.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        personne.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        personne.code?.toString().includes(searchTerm);

    

      return isMatchSearch;
    });
    setFilteredData(filtered);
  }, [data, searchTerm]);

  const handleDelete = (id) => {
    confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cette personne?',
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:3000/api/crud/users/${id}`);
          message.success('Personne supprimée avec succès.');
          setData((prevData) => prevData.filter((personne) => personne.id !== id));
        } catch (error) {
          message.error('Erreur lors de la suppression.');
          console.error('Erreur lors de la suppression:', error);
        }
      },
      onCancel() {
        console.log('Suppression annulée');
      },
    });
  };

  const updateLocalUser = (id, changes) => {
    setData((currentData) =>
      currentData.map((currentUser) =>
        currentUser.id === id ? { ...currentUser, ...changes } : currentUser
      )
    );
  };

  const handleRoleChange = async (id, roles) => {
    try {
      await axios.put(`http://localhost:3000/api/auth/admin/users/${id}/role`, { roles });
      updateLocalUser(id, { roles });
      message.success('Rôle utilisateur mis à jour.');
    } catch (error) {
      message.error(error.response?.data?.message || 'Erreur lors de la modification du rôle.');
    }
  };

  const handleStatusChange = async (id, account_status) => {
    try {
      await axios.put(`http://localhost:3000/api/auth/admin/users/${id}/status`, { account_status });
      updateLocalUser(id, { account_status });
      message.success('Statut du compte mis à jour.');
    } catch (error) {
      message.error(error.response?.data?.message || 'Erreur lors de la modification du statut.');
    }
  };

  const handleDeleteMultiple = () => {
    confirm({
      title: 'Êtes-vous sûr de vouloir supprimer ces personnes?',
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await Promise.all(selectedRowKeys.map(id => 
            axios.delete(`http://localhost:3000/api/crud/personnes/${id}`)
          ));
          message.success('Personnes supprimées avec succès.');
          setData((prevData) => prevData.filter((personne) => !selectedRowKeys.includes(personne.id)));
          setSelectedRowKeys([]);
        } catch (error) {
          message.error('Erreur lors de la suppression.');
          console.error('Erreur lors de la suppression:', error);
        }
      },
      onCancel() {
        console.log('Suppression annulée');
      },
    });
  };

  return (
    <div>
      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">Utilisateur</h2>
          {isAdmin && <Button type='primary' onClick={handleClick}>+ Nouveau</Button>}
        </div>
        <div className="right">
          <Input placeholder='Rechercher...' onChange={(e) => handleSearch(e.target.value)} />
        </div>
      </div>
      <div className="table">
        <Table 
          dataSource={filteredData} 
          rowKey="id"
          scroll={{ y: height, x: '100%' }}
          loading={loading}
          pagination={{
            showTotal: (total) => `Total des personnes : ${total}`,
          }}
          rowSelection={isAdmin ? {
            selectedRowKeys,
            onChange: (selectedRowKeys) => {
              setSelectedRowKeys(selectedRowKeys);
            },
          } : undefined}
        >
          <Column title="id" dataIndex="id" key="id" width={70}/>
          <Column 
            title="Photo" 
            width={80}
            dataIndex="photo" 
            key="photo" 
            render={(photo, record) => (
              <Spin spinning={avatarLoading[record.id]}>
                <Avatar
                  shape="circle"
                  size={60}
                  src={photo}
                  alt="Photo"
                  icon={<UserOutlined />}
                  onLoad={() => setAvatarLoading((prev) => ({ ...prev, [record.id]: false }))}
                  onError={() => setAvatarLoading((prev) => ({ ...prev, [record.id]: false }))}
                />
              </Spin>
            )}
          />
          <Column title="Nom" dataIndex="nom" key="nom" />
          <Column title="Email" dataIndex="email" key="Email" width={300}/>
          <Column
            title="Rôles"
            dataIndex="roles"
            key="Roles"
            render={(roles, record) => {
              const normalizedRole = normalizeRole(roles);
              return isAdmin ? (
                <Select
                  className={`user-table-select user-role-select role-${normalizedRole}`}
                  popupClassName="user-table-select-dropdown"
                  value={normalizedRole}
                  style={{ width: 132 }}
                  onChange={(value) => handleRoleChange(record.id, value)}
                  options={ROLE_OPTIONS}
                />
              ) : getOptionLabel(ROLE_OPTIONS, normalizedRole);
            }}
          />
          <Column
            title="Statut du compte"
            dataIndex="account_status"
            key="status"
            render={(status, record) => {
              const normalizedStatus = String(status || '').toLowerCase();
              return isAdmin ? (
                <Select
                  className={`user-table-select user-status-select status-${normalizedStatus}`}
                  popupClassName="user-table-select-dropdown"
                  value={normalizedStatus}
                  style={{ width: 132 }}
                  onChange={(value) => handleStatusChange(record.id, value)}
                  options={STATUS_OPTIONS}
                />
              ) : getOptionLabel(STATUS_OPTIONS, normalizedStatus);
            }}
          />
          <Column
            title="Action"
            key="action"
            render={(_, record) => (
              <Space size="middle">
                <a className='iconAction' title="Voir" onClick={() => navigate(`/Parametre/Administrateur/User/view/${record.id}`)}><EyeOutlined /></a>
                {isAdmin && <a className='iconAction' title="Modifier" onClick={() => navigate(`/Parametre/Administrateur/User/edit/${record.id}`)}><EditOutlined /></a>}
                {isAdmin && <a className='iconAction' onClick={() => handleDelete(record.id)}><DeleteOutlined /></a>}
              </Space>
            )}
          />
        </Table>
      </div>
    </div>
  );
}

export default TablePersonne;
