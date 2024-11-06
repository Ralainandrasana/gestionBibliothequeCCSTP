import { Table, Input } from 'antd';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/fr';

moment.locale('fr');

const { Column } = Table;

function TablePersonne() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');


  // Fonction pour récupérer les données
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/crud/livre_emprunts_recent');
      setData(response.data);
      setFilteredData(response.data);
      console.log(data)
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
    const filtered = data.filter(empRecent => {
      const isMatchSearch = 
        empRecent.trix?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        empRecent.livrcode?.toLowerCase().includes(searchTerm.toLowerCase());

      return isMatchSearch;
    });
    setFilteredData(filtered);
  }, [data, searchTerm]);
  


  

  return (
    <div>
      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">EmpruntRecent</h2>

        </div>
        <div className="right">
          <Input placeholder='Rechercher...' onChange={(e) => handleSearch(e.target.value)} />
        </div>
      </div>
      <div className="table">
        <Table 
          dataSource={filteredData} 
          rowKey="id" // Assure un identifiant unique pour chaque ligne
          scroll={{ y: 570, x: '100%' }}
          loading={loading}
          pagination={{
            showTotal: (total) => `Total des personnes : ${total}`,
          }}
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
