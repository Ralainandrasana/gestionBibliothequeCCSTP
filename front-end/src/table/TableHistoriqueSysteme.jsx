import { Table, Input, Space } from 'antd';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import height from './height';
import 'moment/locale/fr';

moment.locale('fr');

const { Column } = Table;

function Catalogue() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fonction pour récupérer les données
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/crud/app_logs');
      setData(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error('Erreur lors du fetch des données :', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch des data
  useEffect(() => {
    fetchData();
  }, []);

  // Fonction pour gérer la recherche
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Filtrage des données selon la recherche
  useEffect(() => {
    const filtered = data.filter(livre => {
      const livreTitre = livre.titre?.toLowerCase() || '';
      const livreCote = livre.cote?.toLowerCase() || '';
      const livreISBN = livre.ISBN?.toUpperCase() || '';
      const livreId = livre.id_livre?.toString() || ''; // Conversion de id_livre en string pour comparaison
      const lowerCaseSearch = searchTerm.toLowerCase();

      return (
        livreTitre.includes(lowerCaseSearch) ||
        livreId.includes(lowerCaseSearch) ||
        livreCote.includes(lowerCaseSearch) ||
        livreISBN.includes(lowerCaseSearch)
      );
    });
    setFilteredData(filtered);
  }, [data, searchTerm]);

  return (
    <div>
      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">Historique Systeme</h2>
        </div>
        <div className="right">
          <Space>
            <Input placeholder='rechercher...' onChange={(e) => handleSearch(e.target.value)} />
          </Space>
        </div>
      </div>
      <div className="table">
        <Table 
          dataSource={filteredData} 
          rowKey="id_livre" // Clé unique pour chaque ligne
          scroll={{ y: height, x: 1500 }}
          loading={loading}
          pagination={{
            showTotal: (total) => `Total des livres : ${total}`,
          }}
        >
          {/* Colonne avec tri */}
          <Column 
            title="#id" 
            dataIndex="log_id" 
            key="id_livre" 
            width={70}
            sorter={(a, b) => a.id_livre - b.id_livre} // Activer le tri
          />
          
          
          <Column title="Timestamp" dataIndex="Timestamp" key="Timestamp" width={150} />
          <Column title="Action" dataIndex="Action" key="Action" />
          <Column title="TableName" dataIndex="TableName" key="TableName" />
          <Column title="SqlQuery" dataIndex="SqlQuery" key="SqlQuery" width={300}/>
          <Column title="UserID" dataIndex="UserID" key="UserID" />
          <Column title="ServerIP" dataIndex="ServerIP" key="ServerIP" />
          <Column title="Requestdata" dataIndex="RequestData" key="Requestdata" width={500}/>
          <Column title="RequestCompleted" dataIndex="RequestCompleted" key="RequestCompleted" />
        </Table>
      </div>
    </div>
  );
}

export default Catalogue;
