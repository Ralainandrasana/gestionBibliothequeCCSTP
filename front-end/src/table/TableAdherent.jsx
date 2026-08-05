import { useState } from 'react';
import axios from 'axios';
import { Table, Space, Tag, message, Modal, Button, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/fr';
import height from './height';
import { useAuth } from '../context/AuthContext';
import { hasAnyRole, ROLES } from '../config/accessControl';
import usePaginatedTable from '../hooks/usePaginatedTable';
moment.locale('fr');

const { Column } = Table;
const { confirm } = Modal;

function TableAdherent() {
  const { user } = useAuth();
  const isAdmin = hasAnyRole(user, [ROLES.ADMIN]);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/Adherent/Adherent/ajoutAdherent');
  };

  const [validityFilter, setValidityFilter] = useState('');
  const { data, loading, setSearchTerm, pagination, handleTableChange, refresh } = usePaginatedTable(
    'http://localhost:3000/api/crud/adherents',
    {
      extraParams: { validity: validityFilter },
      transformData: adherent => ({
        ...adherent,
        key: adherent.id_adh,
        validite: moment(adherent.date_fin).isAfter(moment()) ? 'Valide' : 'Invalide'
      })
    }
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

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
      refresh();
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

  return (
    <div>
      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">Adherent</h2>
          <Button type='primary' onClick={handleClick}>+ Nouveau</Button>
        </div>
        <div className="right">
          <Input allowClear placeholder='Rechercher...' onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>
      <div className="table">
        <Table
          rowSelection={isAdmin ? rowSelection : undefined}
          dataSource={data}
          loading={loading}
          pagination={{ ...pagination, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'], showTotal: (total) => `Total : ${total}` }}
          onChange={(nextPagination, filters) => {
            const selectedValidity = (filters.validite || []).find(value => value !== 'Tous') || '';
            setValidityFilter(selectedValidity);
            handleTableChange(nextPagination);
          }}
          scroll={{ y: height, x: '100%' }}
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
            filters={[
              { text: 'Valide', value: 'Valide' },
              { text: 'Invalide', value: 'Invalide' },
              { text: 'Tous', value: 'Tous' },
            ]}
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
                <a className='iconAction' title="Voir" onClick={() => navigate(`/Adherent/Adherent/view/${record.id_adh}`)}><EyeOutlined /></a>
                <a className='iconAction' title="Modifier" onClick={() => navigate(`/Adherent/Adherent/edit/${record.id_adh}`)}><EditOutlined /></a>
                {isAdmin && <a className='iconAction' onClick={() => showDeleteConfirm([record.id_adh])}>
                  <DeleteOutlined />
                </a>}
              </Space>
            )}
          />
        </Table>
      </div>
    </div>
  );
}

export default TableAdherent;
