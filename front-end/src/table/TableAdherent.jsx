import { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Space, Tag, message, Modal, Button, Select, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/fr';
moment.locale('fr');

const { Column } = Table;
const { confirm } = Modal;

function TableAdherent() {

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/Adherent/Adherent/ajoutAdherent');
  };

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tous');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/crud/adherents');
      console.log('API response:', response.data); // Log API response
      const adherents = response.data.map(adherent => ({
        ...adherent,
        key: adherent.id_adh,
      }));
      setData(adherents);
      setFilteredData(adherents);
    } catch (error) {
      console.error('Erreur lors du fetch des données :', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showDeleteConfirm = (ids) => {
    confirm({
      title: 'Êtes-vous sûr de vouloir supprimer les adhérents sélectionnés?',
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk() {
        handleDelete(ids);
      },
    });
  };

  const handleDelete = async (ids) => {
    try {
      await Promise.all(ids.map(id => axios.delete(`http://localhost:3000/api/crud/adherents/${id}`)));
      message.success("Adhérents supprimés avec succès");
      fetchData();
      setSelectedRowKeys([]);
    } catch (error) {
      console.error('Erreur lors de la suppression :', error);
      message.error("Erreur lors de la suppression des adhérents");
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleFilter = (value) => {
    setFilterStatus(value);
  };

  useEffect(() => {
    const filtered = data.filter(adherent => {
      const isMatchSearch = adherent.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || adherent.prenom?.toLowerCase().includes(searchTerm.toLowerCase())|| adherent.code?.toLowerCase().includes(searchTerm.toLowerCase());
      const isValid = moment(adherent.date_fin).isAfter(moment());
      const isMatchStatus = filterStatus === 'Tous' || (filterStatus === 'Valide' && isValid) || (filterStatus === 'Invalide' && !isValid);
      return isMatchSearch && isMatchStatus;
    });
    console.log('Filtered data:', filtered); // Log filtered data
    setFilteredData(filtered);
  }, [data, searchTerm, filterStatus]);

  return (
    <div>
      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">Adherent</h2>
          <Button type='primary' onClick={handleClick}>+ Nouveau</Button>
        </div>
        <div className="right">
          <Select
            defaultValue="Tous"
            style={{ width: 120 }}
            onChange={handleFilter}
            options={[
              { value: 'Valide', label: 'Valide' },
              { value: 'Invalide', label: 'Invalide' },
              { value: 'Tous', label: 'Tous' },
            ]}
          />
          <Input placeholder='Rechercher...' onChange={(e) => handleSearch(e.target.value)} />
        </div>
      </div>
      <div className="table">
        <Table
          rowSelection={rowSelection}
          dataSource={filteredData}
          loading={loading}
          pagination={{ showTotal: (total) => `Total : ${total}` }}
          scroll={{ y: 570, x: '100%' }}
        >
          <Column title="M°" dataIndex="code" key="key" width={70}/>
          <Column title="Nom(s)" dataIndex="nom" key="firstName" width={170}/>
          <Column title="Prenom(s)" dataIndex="prenom" key="lastName" />
          <Column title="Categorie" dataIndex="categorie" key="address" width={80}/>
          <Column title="Pennaliser" dataIndex="penaliser" key="pennaliser" width={70}/>
          <Column
            title="Date readhesion"
            dataIndex="date_reinscription"
            key="dateReadhesion"
            render={(date) => date ? moment(date).format('DD MMM YYYY') : ''}
          />
          <Column
            title="Fin readhesion"
            dataIndex="date_fin"
            key="finReadhesion"
            render={(date) => date ? moment(date).format('DD MMM YYYY') : ''}
          />
          <Column
            title="Validité"
            width={100}
            key="validite"
            render={(_, record) => {
              const isDateExpired = moment(record.date_fin).isBefore(moment());
              return (
                <Tag color={isDateExpired ? 'red' : 'green'}>
                  {isDateExpired ? 'Invalide' : 'Valide'}
                </Tag>
              );
            }}
          />
          <Column
            title="Action"
            key="action"
            render={(_, record) => (
              <Space size="middle">
                <a className='iconAction'><EyeOutlined /></a>
                <a className='iconAction'><EditOutlined /></a>
                <a className='iconAction' onClick={() => showDeleteConfirm([record.id_adh])}>
                  <DeleteOutlined />
                </a>
              </Space>
            )}
          />
        </Table>
      </div>
    </div>
  );
}

export default TableAdherent;
