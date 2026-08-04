import { Table, Input, Space, Tag } from 'antd';
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
    const lowerCaseSearch = searchTerm.trim().toLowerCase();
    const searchableFields = [
      'log_id', 'Timestamp', 'Action', 'TableName', 'RecordID', 'SqlQuery',
      'UserID', 'ServerIP', 'RequestUrl', 'RequestData', 'RequestCompleted', 'RequestMsg'
    ];

    const filtered = data.filter(log => {
      return searchableFields.some(field =>
        String(log[field] ?? '').toLowerCase().includes(lowerCaseSearch)
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
          rowKey="log_id"
          scroll={{ y: height, x: 2100 }}
          loading={loading}
          pagination={{
            showTotal: (total) => `Total des journaux : ${total}`,
          }}
        >
          {/* Colonne avec tri */}
          <Column 
            title="#id" 
            dataIndex="log_id" 
            key="log_id"
            width={70}
            sorter={(a, b) => a.log_id - b.log_id}
          />
          
          
          <Column title="Timestamp" dataIndex="Timestamp" key="Timestamp" width={150} />
          <Column title="Action" dataIndex="Action" key="Action" />
          <Column title="TableName" dataIndex="TableName" key="TableName" />
          <Column title="RecordID" dataIndex="RecordID" key="RecordID" />
          <Column title="SqlQuery" dataIndex="SqlQuery" key="SqlQuery" width={300}/>
          <Column title="UserID" dataIndex="UserID" key="UserID" />
          <Column title="ServerIP" dataIndex="ServerIP" key="ServerIP" />
          <Column title="URL" dataIndex="RequestUrl" key="RequestUrl" width={250} />
          <Column title="Données" dataIndex="RequestData" key="RequestData" width={350}/>
          <Column
            title="Résultat"
            dataIndex="RequestCompleted"
            key="RequestCompleted"
            render={(completed) => {
              const success = String(completed) === 'true';
              return <Tag color={success ? 'success' : 'error'}>{success ? 'Réussi' : 'Échec'}</Tag>;
            }}
          />
          <Column title="Message" dataIndex="RequestMsg" key="RequestMsg" width={280} />
        </Table>
      </div>
    </div>
  );
}

export default Catalogue;
