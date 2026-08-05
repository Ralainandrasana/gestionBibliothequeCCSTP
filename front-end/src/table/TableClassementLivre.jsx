import { Table, Input, Space } from 'antd';
import height from './height';
import 'moment/locale/fr';
import usePaginatedTable from '../hooks/usePaginatedTable';

const { Column } = Table;

function Catalogue() {
  const { data, loading, setSearchTerm, pagination, handleTableChange } = usePaginatedTable(
    'http://localhost:3000/api/other/classementLivres'
  );

  return (
    <div>
      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">Classement livre</h2>
        </div>
        <div className="right">
          <Space>
            <Input allowClear placeholder='rechercher...' onChange={(e) => setSearchTerm(e.target.value)} />
          </Space>
        </div>
      </div>
      <div className="table">
        <Table 
          dataSource={data}
          rowKey="id_livre" // Clé unique pour chaque ligne
          scroll={{ y: height, x: '100%' }}
          loading={loading}
          pagination={{ ...pagination, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'], showTotal: (total) => `Total des livres classés : ${total}` }}
          onChange={handleTableChange}
        >
          <Column title="rang" dataIndex="rang" key="rang"  sorter={(a, b) => b.rang - a.rang} width={80}/>
          <Column title="id_livre" dataIndex="id_livre" key="id_livre"  width={80}/>
          <Column title="titre" dataIndex="titre" key="titre"  width={200}/>
          <Column title="sous_titre" dataIndex="sous_titre" key="sous_titre" width={200}/>
          <Column title="auteur" dataIndex="auteur" key="auteur" width={200}/>
          <Column title="deway" dataIndex="deway" key="deway" width={80}/>
          <Column title="nombreEmprunt" dataIndex="nombreEmprunt" key="nombreEmprunt" />
        </Table>
      </div>
    </div>
  );
}

export default Catalogue;
