import { Table, Input, Select, Space, Button, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import 'moment/locale/fr';

moment.locale('fr');

const { Column } = Table;

function TableEtatDesLivres() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/GestionBibliotheque/EtatDesLivres/ajoutLivre');
  };

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
          <h2 className="titreTable">Livre</h2>
          <Button type='primary' onClick={handleClick}>+ Nouveau</Button>
        </div>
        <div className="right">
          <Select
            defaultValue="Tous les livres"
            style={{ width: 120 }}
            options={[
              { value: 'Livres', label: 'Livres' },
              { value: 'Usuelle', label: 'Usuelle' },
              { value: 'Periodique', label: 'Periodique' },
              { value: 'Pilonner et Perdu', label: 'Pilonner et Perdu' },
              { value: 'Tous les livres', label: 'Tous les livres' },
            ]}
          />
          <Input placeholder='Rechercher...' onChange={(e) => handleSearch(e.target.value)} />
        </div>
      </div>
      <div className="table">
        <Table 
          dataSource={filteredData} 
          rowKey="id_livre" // Clé unique pour chaque ligne
          scroll={{ y: 570, x: 1500 }}
          loading={loading}
          pagination={{
            showTotal: (total) => `Total des livres : ${total}`,
          }}
        >
          <Column title="#id" dataIndex="id_livre" key="id_livre" width={70}/>
          <Column title="Type" dataIndex="Type" key="Type" />
          <Column title="titre" dataIndex="titre" key="titre"  width={100}/>
          <Column title="sous_titre" dataIndex="sous_titre" key="sous_titre" />
          <Column title="auteur" dataIndex="auteur" key="auteur" />
          <Column title="editeur" dataIndex="editeur" key="editeur" />
          <Column title="deway" dataIndex="deway" key="deway" />
          <Column title="cote" dataIndex="cote" key="cote"  width={100}/>
          <Column title="ISBN" dataIndex="ISBN" key="ISBN" />
          <Column title="langue_pays" dataIndex="langue_pays" key="langue_pays" />
          <Column title="dimension" dataIndex="dimension" key="dimension" />
          <Column title="nbre_page" dataIndex="nbre_page" key="nbre_page"  width={70}/>
          <Column title="etat" dataIndex="etat" key="etat" />
          <Column title="status" dataIndex="status" key="status" width={70}/>
          <Column 
            title="date_status" 
            dataIndex="date_status"
            key="date_status" 
            render={(date) => date ? moment(date).format('DD MMM YYYY') : ''}
          />
          <Column
            title="Disponible"
            dataIndex="disponible"
            key="disponible"
            render={(disponible) => (
              <Tag color={disponible ? 'green' : 'red'}>
                {disponible ? 'Oui' : 'Non'}
              </Tag>
            )}
          />
          <Column
            title="Action"
            key="action"
            render={(_, record) => (
              <Space size="middle">
                <a className='iconAction'><EyeOutlined /></a>
                <a className='iconAction'><EditOutlined /></a>
                <a className='iconAction'>
                  <DeleteOutlined />
                </a>
              </Space>
            )}
          />
        </Table>
      </div>
    </div>
  );
}

export default TableEtatDesLivres;