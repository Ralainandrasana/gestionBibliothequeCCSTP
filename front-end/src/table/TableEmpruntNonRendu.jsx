import { Table, Space, Tag, Input, Button, Modal, message, notification } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import height from './height';
import { useAuth } from '../context/AuthContext';
import { hasAnyRole, ROLES } from '../config/accessControl';
import usePaginatedTable from '../hooks/usePaginatedTable';


const { Column } = Table;
const { confirm } = Modal;


function TableEmpruntNonRendu() {
  const { user } = useAuth();
  const isAdmin = hasAnyRole(user, [ROLES.ADMIN]);
  const { data, setData, loading, setSearchTerm, pagination, handleTableChange } = usePaginatedTable(
    '/api/crud/livre_emprunts_non_rendu'
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Pour gérer la sélection multiple

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/GestionBibliotheque/EmpruntLivre/nonRendu/ajoutEmprunt');
  };

//renouveler livre
const handleRenouveler = (id) => {
  confirm({
    title: 'Êtes-vous sûr de vouloir renouveler cet emprunt ?',
    content: 'La nouvelle date de retour sera fixée à 14 jours à partir d’aujourd’hui.',
    okText: 'Oui',
    cancelText: 'Non',
    onOk: async () => {
      try {
        const response = await axios.put(`/api/other/livre_emprunts/renouveler/${id}`);
        if (response.data?.retour_en_retard) {
          notification.warning({
            message: "Adhérent Averti",
            description: "La date de retour était en retard.",
            duration: 10, // Durée en secondes (0 pour une notification permanente)
          });
        }
        message.success(response.data?.message || 'Emprunt renouvelé avec succès.');
        setData((prevData) =>
          prevData.map((item) =>
            item.id === id
              ? {
                  ...item,
                  renouvelable: false,
                  date_emprunt_initiale: response.data?.date_emprunt_initiale || item.date_emprunt,
                  date_emprunt: response.data?.date_emprunt || dayjs(),
                  date_retour: response.data?.date_retour || dayjs().add(14, 'days'),
                }
              : item
          )
        );
      } catch (error) {
        const refusal = error.response?.status === 409
          && error.response?.data?.code === 'RENEWAL_REFUSED';

        if (!refusal) {
          message.error(error.response?.data?.message || 'Erreur lors du renouvellement.');
          console.error('Erreur lors du renouvellement', error);
          return;
        }

        const refusalMessage = error.response.data.message || 'Cet emprunt ne peut pas être renouvelé.';
        const reasons = error.response.data.reasons || [];
        const peutEnregistrerRetour = !reasons.includes('DEJA_RENDU')
          && !reasons.includes('ADHERENT_INTROUVABLE');

        if (!peutEnregistrerRetour) {
          notification.error({
            message: 'Renouvellement refusé',
            description: refusalMessage,
            duration: 10,
          });
          return;
        }

        confirm({
          title: 'Renouvellement refusé',
          content: (
            <div>
              <p>{refusalMessage}</p>
              <p>Voulez-vous enregistrer maintenant le retour réel de ce livre ?</p>
            </div>
          ),
          okText: 'Oui, rendre le livre',
          cancelText: 'Non, conserver l’emprunt',
          onOk: async () => {
            try {
              const returnResponse = await axios.put(`/api/other/livre_emprunts/rendre/${id}`);
              if (returnResponse.data?.retour_en_retard) {
                notification.warning({
                  message: 'Adhérent averti',
                  description: 'La date de retour était en retard.',
                  duration: 10,
                });
              }
              setData((prevData) => prevData.filter((emprunt) => emprunt.id !== id));
              message.success('Retour du livre enregistré avec succès.');
            } catch (returnError) {
              message.error('Erreur lors de l’enregistrement du retour.');
              console.error('Erreur lors du retour après refus du renouvellement :', returnError);
            }
          },
        });
      }
    },
    onCancel() {
      console.log('renouvelement annulée');
    },
  });
};

//rendre livre
const handleRendre = (id) => {
  confirm({
    title: 'Êtes-vous sûr de vouloir rendre le livre cet emprunt?',
    content: 'Cette action est irréversible.',
    okText: 'Oui',
    cancelText: 'Non',
    onOk: async () => {
      try {
        const response = await axios.put(`/api/other/livre_emprunts/rendre/${id}`);
        if (response.data?.retour_en_retard) {

          notification.warning({
            message: "Adhérent Averti",
            description: response.data?.sanctionner
              ? `Date de retour en retard : ${response.data.penaliser} avertissement(s), adhérent sanctionné.`
              : `Date de retour en retard : ${response.data.penaliser} avertissement(s).`,
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

  const handleDelete = (id) => {
    confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cet emprunt?',
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await axios.delete(`/api/crud/livre_emprunts/${id}`);
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
            selectedRowKeys.map((id) => axios.delete(`/api/crud/livre_emprunts/${id}`))
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
            <Button
              type="primary"
              danger
              className="bulk-delete-button"
              icon={<DeleteOutlined />}
              onClick={handleDeleteSelected}
            >
              Supprimer la sélection
            </Button>
          )}
        </div>
        <div className="right">
          <Input allowClear placeholder="Rechercher..." onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>
      <div className="table">
        <Table 
          dataSource={data}
          rowKey="id"
          rowSelection={isAdmin ? rowSelection : undefined}
          scroll={{ y: height, x: '100%' }}
          loading={loading}
          pagination={{ ...pagination, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'], showTotal: (total) => `Total des emprunts : ${total}` }}
          onChange={handleTableChange}
        >
          <Column title="#id" dataIndex="id" key="id" width={70}/>
          <Column title="Adherent" dataIndex="trix" key="trix" />
          <Column title="Livre" dataIndex="livrcode" key="livrcode" />
          <Column 
            title="Date Emprunt" 
            dataIndex="date_emprunt"
            key="date_emprunt" 
            width={110}
            render={(date) => date ? dayjs(date).format('DD MMM YYYY') : ''}
          />
          <Column 
            title="Date Retour" 
            width={110}
            dataIndex="date_retour"
            key="date_retour" 
            render={(date) => date ? dayjs(date).format('DD MMM YYYY') : ''}
          />
          <Column 
            title="Observation" 
            key="observation"
            width={100}
            render={(_, record) => {
              const isDateOverdue = dayjs().isAfter(dayjs(record.date_retour), 'day');
              return (
                <Tag color={isDateOverdue ? 'red' : 'cyan'}>
                  {isDateOverdue ? dayjs().diff(dayjs(record.date_retour), 'days')+' jrs retard' : dayjs(record.date_retour).diff(dayjs(), 'days')+' jrs reste'}
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
                  onClick={() => handleRenouveler(record.id)}
                >
                  Renouv.
                </Button>

                <Button 
                  type="primary" 
                  size="small"
                  onClick={() => handleRendre(record.id)}
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
                <a className="iconAction" title="Voir" onClick={() => navigate(`/GestionBibliotheque/EmpruntLivre/nonRendu/view/${record.id}`)}><EyeOutlined /></a>
                <a className="iconAction" title="Modifier" onClick={() => navigate(`/GestionBibliotheque/EmpruntLivre/nonRendu/edit/${record.id}`)}><EditOutlined /></a>
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
