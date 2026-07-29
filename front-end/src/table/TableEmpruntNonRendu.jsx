import { Table, Space, Tag, Input, Button, Modal, message, Spin, notification } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import dayjs from 'dayjs';
import height from './height';
import { useAuth } from '../context/AuthContext';
import { hasAnyRole, ROLES } from '../config/accessControl';
import 'moment/locale/fr';

moment.locale('fr');

const { Column } = Table;
const { confirm } = Modal;
const today = dayjs();


function TableEmpruntNonRendu() {
  const { user } = useAuth();
  const isAdmin = hasAnyRole(user, [ROLES.ADMIN]);
  const [matricule, setMatricule] = useState([]);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Pour gérer la sélection multiple
  const [adherantAverti, setAdherantAverti] = useState([]);

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/GestionBibliotheque/EmpruntLivre/nonRendu/ajoutEmprunt');
  };

// Fonction pour rechercher les matricules depuis la base de données
const fetchMatricule = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/api/other/empruntInvalide`);
    
    // Inclure à la fois 'id' et 'tri' pour pouvoir utiliser id lors de la sélection
    const matricules = response.data.map(item => item.id_adh);
    setMatricule(matricules);
  } catch (error) {
    console.error("Erreur lors de la récupération des matricule :", error);
  }
};


  // Fonction pour récupérer les données
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/crud/livre_emprunts_non_rendu');
      setData(response.data);
      setFilteredData(response.data);
      console.log(data);
    } catch (error) {
      console.error('Erreur lors du fetch des données :', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch des data
  useEffect(() => {
    fetchData();
    fetchMatricule();
  }, []);


//renouveler livre
const handleRenouveler = (id, id_adh, id_livre, date_retour) => {
  confirm({
    title: 'Êtes-vous sûr de vouloir renouveler cet emprunt?',
    content: 'Cette action est irréversible.',
    okText: 'Oui',
    cancelText: 'Non',
    onOk: async () => {
      try {
        if(today.isAfter(dayjs(date_retour))){//RETOUR EN RETARD
          await axios.put(`http://localhost:3000/api/other/adherent/avertir/${id_adh}`);
          notification.warning({
            message: "Adhérent Averti",
            description: "car la date de retour est en retard",
            duration: 10, // Durée en secondes (0 pour une notification permanente)
          });
        }
        if(matricule.includes(id_adh)){
          await axios.put(`http://localhost:3000/api/other/livre_emprunts/rendre/${id}`);
          await axios.put(`http://localhost:3000/api/other/adherent/rendre/${id_adh}`);
          await axios.put(`http://localhost:3000/api/other/livre/rendre/${id_livre}`);
          setData((prevData) => prevData.filter((personne) => personne.id !== id));
          notification.error({
            message: "Renouvelement refusé",
            description: "emprunt rendu automatiqument car date validite expire ou adherant sanctionne ou nombre de livre superieur a 2",
            duration: 10, // Durée en secondes (0 pour une notification permanente)
          });
        }else{
          await axios.put(`http://localhost:3000/api/other/livre_emprunts/renouveler/${id}`);
          message.success('Emprunt renouvelé avec succès.');
          setData((prevData) =>
            prevData.map((item) =>
              item.id === id ? { ...item, renouvelable: false, date_emprunt: moment(), date_retour: moment().add(14, 'days') } : item
            )
          );
        }
        
      } catch (error) {
        message.error('Erreur lors du renouvelement');
        console.error('Erreur lors du renouvelement', error);
      }
    },
    onCancel() {
      console.log('renouvelement annulée');
    },
  });
};

//rendre livre
const handleRendre = (id, id_adh, id_livre, date_retour) => {
  confirm({
    title: 'Êtes-vous sûr de vouloir rendre le livre cet emprunt?',
    content: 'Cette action est irréversible.',
    okText: 'Oui',
    cancelText: 'Non',
    onOk: async () => {
      try {
        await axios.put(`http://localhost:3000/api/other/livre_emprunts/rendre/${id}`);
        await axios.put(`http://localhost:3000/api/other/adherent/rendre/${id_adh}`);
        await axios.put(`http://localhost:3000/api/other/livre/rendre/${id_livre}`);
        if(today.isAfter(dayjs(date_retour))){//RETOUR EN RETARD
          await axios.put(`http://localhost:3000/api/other/adherent/avertir/${id_adh}`);

          //recuperation nombre d'avertissement
          // const response = await axios.get(`http://localhost:3000/api/other/adherent/search/${id_adh}`);
          // setAdherantAverti(response.data);
          // const nbrAvert = adherantAverti[0].penaliser;

          notification.warning({
            message: "Adhérent Averti",
            description: "Date de retour en retard",
            duration: 10, // Durée en secondes (0 pour une notification permanente)
          });
        }
        message.success('Livre rendu avec succès.');
        setData((prevData) => prevData.filter((personne) => personne.id !== id));
      } catch (error) {
        message.error('Erreur lors du rendu');
        console.error('Erreur lors du rendu:', error);
      }
    },
    onCancel() {
      console.log('Suppression annulée');
    },
  });
};

  // Fonction pour gérer la recherche
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cet emprunt?',
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:3000/api/crud/livre_emprunts/${id}`);
          message.success('Emprunt supprimée avec succès.');
          setData((prevData) => prevData.filter((personne) => personne.id !== id));
        } catch (error) {
          message.error('Erreur lors de la suppression.');
          console.error('Erreur lors de la suppression:', error);
        }
      },
      onCancel() {
        console.log('Suppression annulée');
      },
    });
  };

  // Fonction de suppression multiple
  const handleDeleteSelected = () => {
    confirm({
      title: 'Êtes-vous sûr de vouloir supprimer les emprunts sélectionnés?',
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await Promise.all(
            selectedRowKeys.map((id) => axios.delete(`http://localhost:3000/api/crud/livre_emprunts/${id}`))
          );
          message.success('Emprunts supprimés avec succès.');
          setData((prevData) => prevData.filter((personne) => !selectedRowKeys.includes(personne.id)));
          setSelectedRowKeys([]); // Réinitialiser la sélection après suppression
        } catch (error) {
          message.error('Erreur lors de la suppression.');
          console.error('Erreur lors de la suppression:', error);
        }
      },
      onCancel() {
        console.log('Suppression multiple annulée');
      },
    });
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

  // Configuration pour la sélection multiple
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };
  
  return (
    <div>
      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">Liste Emprunt</h2>
          <Button type="primary" onClick={handleClick}>+ Nouveau</Button>
          {isAdmin && selectedRowKeys.length > 0 && (
            <Button type="danger" onClick={handleDeleteSelected} style={{ marginLeft: 10 }}>
              Supprimer Sélection
            </Button>
          )}
        </div>
        <div className="right">
          <Input placeholder="Rechercher..." onChange={(e) => handleSearch(e.target.value)} />
        </div>
      </div>
      <div className="table">
        <Table 
          dataSource={filteredData} 
          rowKey="id"
          rowSelection={isAdmin ? rowSelection : undefined}
          scroll={{ y: height, x: '100%' }}
          loading={loading}
          pagination={{
            showTotal: (total) => `Total des personnes : ${total}`,
          }}
        >
          <Column title="#id" dataIndex="id" key="id" width={70}/>
          <Column title="Adherent" dataIndex="trix" key="trix" />
          <Column title="Livre" dataIndex="livrcode" key="livrcode" />
          <Column 
            title="Date Emprunt" 
            dataIndex="date_emprunt"
            key="date_emprunt" 
            width={110}
            render={(date) => date ? moment(date).format('DD MMM YYYY') : ''}
          />
          <Column 
            title="Date Retour" 
            width={110}
            dataIndex="date_retour"
            key="date_retour" 
            render={(date) => date ? moment(date).format('DD MMM YYYY') : ''}
          />
          <Column 
            title="Observation" 
            key="observation"
            width={100}
            render={(_, record) => {
              const isDateOverdue = moment().isAfter(moment(record.date_retour), 'day');
              return (
                <Tag color={isDateOverdue ? 'red' : 'cyan'}>
                  {isDateOverdue ?  moment().diff(moment(record.date_retour), 'days')+' jrs retard' : moment(record.date_retour).diff(moment(), 'days')+' jrs reste'}
                </Tag>
              );
            }}
          />
          <Column
            title="Operation"
            key="operation"
            render={(_, record) => (
              <Space size="small">
                <Button 
                  color="primary" 
                  variant="outlined" 
                  size="small" 
                  disabled={!record.renouvelable}
                  onClick={() => handleRenouveler(record.id, record.id_adh, record.id_livre, record.date_retour)}
                >
                  Renouv.
                </Button>

                <Button 
                  type="primary" 
                  size="small"
                  onClick={() => handleRendre(record.id, record.id_adh, record.id_livre, record.date_retour)}
                >Rendre
                </Button>
              </Space>
            )}
          />
          <Column
            title="Action"
            key="action"
            align="center"
            width={100}
            render={(_, record) => (
              <Space size="middle">
                <a className="iconAction"><EyeOutlined /></a>
                <a className="iconAction"><EditOutlined /></a>
                {isAdmin && <a className="iconAction" onClick={() => handleDelete(record.id)}><DeleteOutlined /></a>}
              </Space>
            )}
          />
        </Table>
      </div>
    </div>
  );
}

export default TableEmpruntNonRendu;
