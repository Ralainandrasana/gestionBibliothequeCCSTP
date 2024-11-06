import { Table, Space, Avatar, Select, Input, Button, Modal, message, Spin } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/fr';
moment.locale('fr');

const { Column } = Table;
const { confirm } = Modal;

function TablePersonne() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Tous');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [avatarLoading, setAvatarLoading] = useState({}); // Suivre le chargement des avatars

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/Adherent/Personne/ajoutPersonne');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/crud/personnes');
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

  const handleFilter = (value) => {
    setFilterCategory(value);
  };

  useEffect(() => {
    const filtered = data.filter(personne => {
      const isMatchSearch = 
        personne.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        personne.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        personne.code?.toString().includes(searchTerm);

      const isCategoryMatch = 
        filterCategory === 'Tous' || 
        (filterCategory === 'Enfant' && personne.categorie === 'Enfant') || 
        (filterCategory === 'Non Enfant' && (personne.categorie === 'Jeune et Adulte' || personne.categorie === 'Adulte'));

      return isMatchSearch && isCategoryMatch;
    });
    setFilteredData(filtered);
  }, [data, searchTerm, filterCategory]);

  const handleDelete = (id) => {
    confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cette personne?',
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:3000/api/crud/personnes/${id}`);
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
          <h2 className="titreTable">Personne</h2>
          <Button type='primary' onClick={handleClick}>+ Nouveau</Button>
        </div>
        <div className="right">
          <Select
            defaultValue="Tous"
            style={{ width: 120 }}
            onChange={handleFilter}
            options={[
              { value: 'Enfant', label: 'Enfant' },
              { value: 'Non Enfant', label: 'Jeune ou Adulte' },
              { value: 'Tous', label: 'Tous' },
            ]}
          />
          <Input placeholder='Rechercher...' onChange={(e) => handleSearch(e.target.value)} />
        </div>
      </div>
      <div className="table">
        <Table 
          dataSource={filteredData} 
          rowKey="id"
          scroll={{ y: 570, x: '100%' }}
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
          <Column title="M°" dataIndex="code" key="code" width={70}/>
          <Column 
            title="Photo" 
            width={80}
            dataIndex="photo" 
            key="photo" 
            render={(photo, record) => (
              <Spin spinning={avatarLoading[record.id]}>
                <Avatar
                  shape="square"
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
          <Column title="Nom(s)" dataIndex="nom" key="nom" />
          <Column title="Prenom(s)" dataIndex="prenom" key="prenom" />
          <Column title="Adresse" dataIndex="adresse" key="adresse" />
          <Column title="Profession" dataIndex="profession" key="profession" />
          <Column title="Téléphone" dataIndex="tel" key="tel" />
          <Column 
            title="Date de Naissance" 
            dataIndex="date_nais"
            key="date_nais" 
            render={(date) => date ? moment(date).format('DD MMM YYYY') : ''}
          />
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
