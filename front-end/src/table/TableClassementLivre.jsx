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
      const response = await axios.get('http://localhost:3000/api/other/classementLivres');
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
    const filtered = data.filter(adherant => {
      const nom = adherant.nom?.toLowerCase() || '';
      const code = adherant.code?.toString() || '';
      const prenom = adherant.prenom?.toLowerCase() || ''; // Conversion de id_livre en string pour comparaison
      const lowerCaseSearch = searchTerm.toLowerCase();

      return (
        nom.includes(lowerCaseSearch) ||
        prenom.includes(lowerCaseSearch) || code.includes(lowerCaseSearch)
      );
    });
    setFilteredData(filtered);
  }, [data, searchTerm]);

  return (
    <div>
      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">Classement livre</h2>
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
          scroll={{ y: height, x: '100%' }}
          loading={loading}
          pagination={{
            showTotal: (total) => `Total des livres : ${total}`,
          }}
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
