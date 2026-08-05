import { Table, Input, Space } from 'antd';
import { useState } from 'react';
import height from './height';
import 'moment/locale/fr';
import usePaginatedTable from '../hooks/usePaginatedTable';

const { Column } = Table;

function Catalogue() {
  const [serverFilters, setServerFilters] = useState({});
  const { data, loading, setSearchTerm, pagination, handleTableChange } = usePaginatedTable(
    'http://localhost:3000/api/crud/livres',
    {
      extraParams: {
        type: (serverFilters.Type || []).join(','),
        dewey: (serverFilters.deway || []).join(',')
      }
    }
  );

  return (
    <div>
      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">Catalogue</h2>
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
          pagination={{ ...pagination, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'], showTotal: (total) => `Total des livres : ${total}` }}
          onChange={(nextPagination, filters) => {
            setServerFilters(filters);
            handleTableChange(nextPagination);
          }}
        >
          {/* Colonne avec tri */}
          <Column 
            title="#id" 
            dataIndex="id_livre" 
            key="id_livre" 
            width={70}
            sorter={(a, b) => a.id_livre - b.id_livre} // Activer le tri
          />
          
          {/* Filtre sur Type */}
          <Column 
            title="Type" 
            dataIndex="Type" 
            key="Type" 
            filters={[
              { text: 'Livres', value: 'Livre' },
              { text: 'Usuelle', value: 'Usuelle' },
              { text: 'Periodique', value: 'Périodique' },
              { text: 'Tous', value: 'Tous' },
            ]}
            onFilter={(value, record) => record.Type === value || value === 'Tous'}
          />
          
          <Column title="titre" dataIndex="titre" key="titre" width={150} />
          <Column title="auteur" dataIndex="auteur" key="auteur" />
          <Column title="editeur" dataIndex="editeur" key="editeur" />

          {/* Filtre sur Dewey */}
          <Column 
            title="deway" 
            dataIndex="deway" 
            key="deway" 
            filters={[
              { text: '000 | Generalite', value: '0' },
              { text: '100 | Philosophie', value: '1' },
              { text: '200 | Religion', value: '2' },
              { text: '300 | Sciences sociales', value: '3' },
              { text: '400 | Langues', value: '4' },
              { text: '500 | Sciences', value: '5' },
              { text: '600 | Technologies', value: '6' },
              { text: '700 | Arts loisirs sports', value: '7' },
              { text: '800 | Littérature', value: '8' },
              { text: '900 | Histoire-géographie', value: '9' },
              { text: 'Tous', value: 'Tous' },
            ]}
            onFilter={(value, record) => record.deway === value || value === 'Tous'}
          />

          <Column title="cote" dataIndex="cote" key="cote" width={100} />
          <Column title="langue_pays" dataIndex="langue_pays" key="langue_pays" />
          <Column title="nbre_page" dataIndex="nbre_page" key="nbre_page" width={70} />
          <Column title="ISBN" dataIndex="ISBN" key="ISBN" width={100} />
        </Table>
      </div>
    </div>
  );
}

export default Catalogue;
