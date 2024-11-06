import { Table, Input, Space } from 'antd';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
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
      const response = await axios.get('http://localhost:3000/api/crud/livres');
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
      const livreId = livre.id_livre?.toString() || ''; // Conversion de id_livre en string pour comparaison
      const lowerCaseSearch = searchTerm.toLowerCase();

      return (
        livreTitre.includes(lowerCaseSearch) ||
        livreId.includes(lowerCaseSearch)
      );
    });
    setFilteredData(filtered);
  }, [data, searchTerm]);

  return (
    <div>
      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">Catalogue</h2>
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
          scroll={{ y: 570, x: '100%' }}
          loading={loading}
          pagination={{
            showTotal: (total) => `Total des livres : ${total}`,
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
