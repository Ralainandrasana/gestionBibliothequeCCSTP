import { Table, Input, Space, Button, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import height from './height';
import { useAuth } from '../context/AuthContext';
import { hasAnyRole, ROLES } from '../config/accessControl';
import usePaginatedTable from '../hooks/usePaginatedTable';
import 'moment/locale/fr';

moment.locale('fr');

const { Column } = Table;

function TableEtatDesLivres() {
  const { user } = useAuth();
  const isAdmin = hasAnyRole(user, [ROLES.ADMIN]);
  const { data, loading, setSearchTerm, pagination, handleTableChange } = usePaginatedTable(
    'http://localhost:3000/api/crud/livres'
  );

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/GestionBibliotheque/EtatDesLivres/ajoutLivre');
  };

  return (
    <div>
      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">Livre</h2>
          <Button type='primary' onClick={handleClick}>+ Nouveau</Button>
        </div>
        <div className="right">
          <Input allowClear placeholder='Rechercher...' onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>
      <div className="table">
        <Table 
          dataSource={data}
          rowKey="id_livre" // Clé unique pour chaque ligne
          scroll={{ y: height, x: 1500 }}
          loading={loading}
          pagination={{ ...pagination, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'], showTotal: (total) => `Total des livres : ${total}` }}
          onChange={handleTableChange}
        >
          <Column title="#id" dataIndex="id_livre" key="id_livre" width={70}/>
          <Column title="Type" dataIndex="Type" key="Type" />
          <Column title="titre" dataIndex="titre" key="titre"  width={100}/>
          <Column title="sous_titre" dataIndex="sous_titre" key="sous_titre" />
          <Column title="auteur" dataIndex="auteur" key="auteur" />
          <Column title="editeur" dataIndex="editeur" key="editeur" />
          <Column title="deway" dataIndex="deway" key="deway" />
          <Column title="cote" dataIndex="cote" key="cote"  width={100}/>
          <Column title="ISBN" dataIndex="ISBN" key="ISBN" />
          <Column title="langue_pays" dataIndex="langue_pays" key="langue_pays" />
          <Column title="dimension" dataIndex="dimension" key="dimension" />
          <Column title="nbre_page" dataIndex="nbre_page" key="nbre_page"  width={70}/>
          <Column title="etat" dataIndex="etat" key="etat" />
          <Column title="status" dataIndex="status" key="status" width={70}/>
          <Column 
            title="date_status" 
            dataIndex="date_status"
            key="date_status" 
            render={(date) => date ? moment(date).format('DD MMM YYYY') : ''}
          />
          <Column
            title="Disponible"
            dataIndex="disponible"
            key="disponible"
            render={(disponible) => (
              <Tag color={disponible ? 'green' : 'red'}>
                {disponible ? 'Oui' : 'Non'}
              </Tag>
            )}
          />
          <Column
            title="Action"
            key="action"
            render={(_, record) => (
              <Space size="middle">
                <a className='iconAction' title="Voir" onClick={() => navigate(`/GestionBibliotheque/EtatDesLivres/view/${record.id_livre}`)}><EyeOutlined /></a>
                <a className='iconAction' title="Modifier" onClick={() => navigate(`/GestionBibliotheque/EtatDesLivres/edit/${record.id_livre}`)}><EditOutlined /></a>
                {isAdmin && <a className='iconAction'>
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

export default TableEtatDesLivres;
