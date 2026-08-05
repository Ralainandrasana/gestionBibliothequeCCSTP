import { Table, Input, Space } from 'antd';
import height from './height';
import 'moment/locale/fr';
import usePaginatedTable from '../hooks/usePaginatedTable';

const { Column } = Table;

function Catalogue() {
  const { data, loading, setSearchTerm, pagination, handleTableChange } = usePaginatedTable(
    'http://localhost:3000/api/other/classementAdherents'
  );

  return (
    <div>
      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">Classement adherant</h2>
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
          rowKey="rang"
          scroll={{ y: height, x: '100%' }}
          loading={loading}
          pagination={{ ...pagination, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'], showTotal: (total) => `Total des adhérents classés : ${total}` }}
          onChange={handleTableChange}
        >
          <Column title="rang" dataIndex="rang" key="rang"  sorter={(a, b) => b.rang - a.rang}/>
          <Column title="code" dataIndex="code" key="code"  />
          <Column title="nom" dataIndex="nom" key="nom"  />
          <Column title="prenom" dataIndex="prenom" key="prenom" />
          <Column title="categorie" dataIndex="categorie" key="categorie" />
          <Column title="nombreEmpruntEffectue" dataIndex="nombreEmpruntEffectue" key="nombreEmpruntEffectue" />
        </Table>
      </div>
    </div>
  );
}

export default Catalogue;
