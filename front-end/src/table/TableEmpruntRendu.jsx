import { Table, Input } from 'antd';
import moment from 'moment';
import height from './height';
import 'moment/locale/fr';
import usePaginatedTable from '../hooks/usePaginatedTable';

moment.locale('fr');

const { Column } = Table;

function TablePersonne() {
  const { data, loading, setSearchTerm, pagination, handleTableChange } = usePaginatedTable(
    'http://localhost:3000/api/crud/livre_emprunts_recent'
  );
  


  

  return (
    <div>
      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">EmpruntRecent</h2>
        </div>
        <div className="right">
          <Input allowClear placeholder='Rechercher...' onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>
      <div className="table">
        <Table 
          dataSource={data}
          rowKey="id" // Assure un identifiant unique pour chaque ligne
          scroll={{ y: height, x: '100%' }}
          loading={loading}
          pagination={{ ...pagination, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'], showTotal: (total) => `Total des emprunts : ${total}` }}
          onChange={handleTableChange}
        >
          <Column title="#id" dataIndex="id" key="id" width={70}/>
          <Column title="Adherent" dataIndex="trix" key="trix" width={300}/>
          <Column title="Livre" dataIndex="livrcode" key="livrcode" width={300}/>
          <Column 
            title="Date Emprunt" 
            dataIndex="date_emprunt"
            key="date_emprunt" 
            render={(date) => date ? moment(date).format('DD MMM YYYY') : ''}
          />
          <Column 
            title="Date Retour" 
            dataIndex="date_retour"
            key="date_retour" 
            render={(date) => date ? moment(date).format('DD MMM YYYY') : ''}
          />
        </Table>
      </div>
    </div>
  );
}

export default TablePersonne;
