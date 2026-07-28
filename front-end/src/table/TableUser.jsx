import { Table, Space, Avatar, Select, Input, Button, Modal, message, Spin } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import height from './height';
import 'moment/locale/fr';
moment.locale('fr');

const { Column } = Table;
const { confirm } = Modal;

function TablePersonne() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [avatarLoading, setAvatarLoading] = useState({}); // Suivre le chargement des avatars

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/Adherent/Personne/ajoutPersonne');
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
          <Button type='primary' onClick={handleClick}>+ Nouveau</Button>
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
          rowSelection={{
            selectedRowKeys,
            onChange: (selectedRowKeys) => {
              setSelectedRowKeys(selectedRowKeys);
            },
          }}
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
          <Column title="Roles" dataIndex="roles" key="Roles" />
          <Column title="Status Compte" dataIndex="account_status" key="status" />
          <Column
            title="Action"
            key="action"
            render={(_, record) => (
              <Space size="middle">
                <a className='iconAction'><EyeOutlined /></a>
                <a className='iconAction'><EditOutlined /></a>
                <a className='iconAction' onClick={() => handleDelete(record.id)}><DeleteOutlined /></a>
              </Space>
            )}
          />
        </Table>
      </div>
    </div>
  );
}

export default TablePersonne;
