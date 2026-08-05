import { Table, Space, Avatar, Input, Button, Modal, message, Spin } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import height from './height';
import { useAuth } from '../context/AuthContext';
import { hasAnyRole, ROLES } from '../config/accessControl';
import usePaginatedTable from '../hooks/usePaginatedTable';
import 'moment/locale/fr';
moment.locale('fr');

const { Column } = Table;
const { confirm } = Modal;

function TablePersonne() {
  const { user } = useAuth();
  const isAdmin = hasAnyRole(user, [ROLES.ADMIN]);
  const { data, setData, loading, setSearchTerm, pagination, handleTableChange } = usePaginatedTable(
    'http://localhost:3000/api/crud/personnes'
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [avatarLoading, setAvatarLoading] = useState({}); // Suivre le chargement des avatars

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/Adherent/Personne/ajoutPersonne');
  };

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

  return (
    <div>
      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">Personne</h2>
          <Button type='primary' onClick={handleClick}>+ Nouveau</Button>
        </div>
        <div className="right">
          <Input allowClear placeholder='Rechercher...' onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>
      <div className="table">
        <Table 
          dataSource={data}
          rowKey="id"
          scroll={{ y: height, x: '100%' }}
          loading={loading}
          pagination={{ ...pagination, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'], showTotal: (total) => `Total des personnes : ${total}` }}
          onChange={handleTableChange}
          rowSelection={isAdmin ? {
            selectedRowKeys,
            onChange: (selectedRowKeys) => {
              setSelectedRowKeys(selectedRowKeys);
            },
          } : undefined}
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
                <a className='iconAction' title="Voir" onClick={() => navigate(`/Adherent/Personne/view/${record.id}`)}><EyeOutlined /></a>
                <a className='iconAction' title="Modifier" onClick={() => navigate(`/Adherent/Personne/edit/${record.id}`)}><EditOutlined /></a>
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
