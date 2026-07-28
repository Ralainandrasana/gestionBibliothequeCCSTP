import { Table, Input, Space } from 'antd';
import React, { useState, useEffect } from 'react';
import height from './height';
import axios from 'axios';

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
      const response = await axios.get('http://localhost:3000/api/crud/Deweys');
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
    const filtered = data.filter(dewey => {
      const deweyTitre = dewey.titre?.toLowerCase() || '';
      const deweyCode = dewey.code?.toLowerCase() || ''; // Conversion de id_livre en string pour comparaison
      const lowerCaseSearch = searchTerm.toLowerCase();

      return (
        deweyTitre.includes(lowerCaseSearch) ||
        deweyCode.includes(lowerCaseSearch)
      );
    });
    setFilteredData(filtered);
  }, [data, searchTerm]);

  return (
    <div>
      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">Dewey</h2>
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
          rowKey="code" // Clé unique pour chaque ligne
          scroll={{ y: height, x: '100%' }}
          loading={loading}
          pagination={{
            showTotal: (total) => `Total des livres : ${total}`,
          }}
        >
          {/* Colonne avec tri */}
          <Column 
            title="code" 
            dataIndex="code" 
            key="code" 
            width={70}
          /> 
          <Column title="titre" dataIndex="titre" key="titre" width={150} />
          <Column title="description" dataIndex="description" key="description" />
        </Table>
      </div>
    </div>
  );
}

export default Catalogue;
