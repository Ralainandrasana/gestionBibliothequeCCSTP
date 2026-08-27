import { Button, Form, DatePicker, Select, message } from 'antd';
import { RightOutlined, HomeOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import useDebouncedRemoteOptions from '../hooks/useDebouncedRemoteOptions';

const onFinish = async (values, navigate) => {
  const formData = new FormData();
  console.log("Données du formulaire :", values);

  Object.keys(values).forEach((key) => {
    if (key === 'date_emprunt' || key === 'date_retour') {
      formData.append(key, values[key].format('YYYY-MM-DD'));
    } else {
      formData.append(key, values[key]);
    }
  });
  try {
    const response = await axios.post('/api/crud/livre_emprunts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Formulaire soumis avec succès :', response.data);
    message.success('Ajout avec succès !'); // Show success message
    navigate('/GestionBibliotheque/EmpruntLivre/nonRendu'); // Redirect to the specified route
  } catch (error) {
    console.log('Erreur lors de la soumission du formulaire :', error);
    message.error("Erreur lors de l'ajout, veuillez réessayer."); // Show error message
  }
};

const onFinishFailed = (errorInfo) => {
  console.log('Échec de la soumission du formulaire :', errorInfo);
};

const getAdherentRestrictionMessage = (restriction) => {
  if (!restriction) return null;

  const messages = [];

  if (Number(restriction.est_sanctionne) === 1) {
    messages.push("Cet adhérent est sanctionné et ne peut pas effectuer d'emprunt.");
  }

  if (Number(restriction.adhesion_expiree) === 1) {
    const expirationDate = restriction.date_fin && dayjs(restriction.date_fin).isValid()
      ? dayjs(restriction.date_fin).format('DD/MM/YYYY')
      : null;
    messages.push(
      expirationDate
        ? `L'adhésion de cet adhérent a expiré le ${expirationDate}.`
        : "L'adhésion de cet adhérent est expirée."
    );
  }

  if (Number(restriction.limite_livres_atteinte) === 1) {
    const borrowedBooks = Number(restriction.nbrLivreEmp) || 0;
    messages.push(
      `Cet adhérent a atteint la limite de 2 livres empruntés simultanément (${borrowedBooks} actuellement).`
    );
  }

  return messages.join(' • ');
};

function AjoutPersonne() {
  const navigate = useNavigate(); // Initialize navigate
  const {
    options: optionsAdh,
    loading: adherentsLoading,
    search: fetchAdherentSuggestions,
  } = useDebouncedRemoteOptions({
    endpoint: '/api/other/autoCompleteAdherents',
    valueKey: 'id_adh',
    labelKey: 'trix',
  });
  const {
    options: optionsLiv,
    loading: livresLoading,
    search: fetchLivreSuggestions,
  } = useDebouncedRemoteOptions({
    endpoint: '/api/other/autoCompleteLivres',
    valueKey: 'id_livre',
    labelKey: 'livrcode',
  });
  const [form] = Form.useForm(); // Utilisez l'instance form
  const today = dayjs();
  const afterFourteenDay = today.add(14, "day");

  const [adherentsInvalides, setAdherentsInvalides] = useState([]);
  const [livreNonDispo, setLivreNonDispo] = useState([]);


  // Fonction pour rechercher les matricules depuis la base de données
  const fetchAdherentsInvalides = async () => {
      try {
        const response = await axios.get(`/api/other/empruntInvalide`);
        setAdherentsInvalides(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Erreur lors de la récupération des restrictions des adhérents :", error);
      }
  };

  // Fonction pour rechercher les matricules depuis la base de données
  const fetchLivreNonDispo = async () => {
    try {
      const response = await axios.get(`/api/other/livresNonDispo`);
      
      // Inclure à la fois 'id' et 'tri' pour pouvoir utiliser id lors de la sélection
      const idLivres = response.data.map(item => item.id_livre);
      setLivreNonDispo(idLivres);
    } catch (error) {
      console.error("Erreur lors de la récupération des livres non dispo :", error);
    }
};

useEffect(() => {
    fetchAdherentsInvalides();
    fetchLivreNonDispo();
    }, []);

const handleDateChange = (date) =>{
    if(date){
      const dateRetour = dayjs(date).add(14, "day");
      form.setFieldsValue({date_retour: dateRetour});
    }
  }


  return (
    <div className='component'>
      <div className="rout">
        <div className="icon">
          <HomeOutlined style={{ fontSize: '12px', color: '#061C6B' }} />
        </div>
        <div className="icon">
          <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin: '0 4px' }} />
        </div>
        <p>Gestion Bibliothèque</p>
        <div className="icon">
          <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin: '0 4px' }} />
        </div>
        <p>Emprunt Livre</p>
        <div className="icon">
          <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin: '0 4px' }} />
        </div>
        <p>Non Rendu</p>
      </div>

      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">Ajout Emprunt</h2>
        </div>
      </div>

      <div className="form">
        <Form
          form={form} // Associez l'instance form au formulaire
          name="basic"
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 10 }}
          initialValues={{ 
            remember: true ,
            date_emprunt: today,
            date_retour: afterFourteenDay
          }}
          onFinish={(values) => onFinish(values, navigate)} // Pass navigate to onFinish
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >

          <Form.Item
            label="Adherent"
            name="code_pers"
            rules={[
              { required: true, message: 'Veuillez entrer le personne !' },
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.resolve(); // Pas d'erreur si le champ est vide (gestion faite par `required`)
                  }
                  const restriction = adherentsInvalides.find(
                    (item) => String(item.id_adh) === String(value)
                  );
                  const restrictionMessage = getAdherentRestrictionMessage(restriction);

                  if (restrictionMessage) {
                    return Promise.reject(new Error(restrictionMessage));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Select
              showSearch
              allowClear
              filterOption={false}
              optionLabelProp="label"
              options={optionsAdh}
              loading={adherentsLoading}
              onSearch={fetchAdherentSuggestions} // Appelé lors de la saisie
              placeholder="Tapez pour rechercher..."
            />
          </Form.Item>

          <Form.Item
            label="Livre"
            name="id_livre"
            rules={[
              { required: true, message: 'Veuillez entrer livre !' },
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.resolve(); // Pas d'erreur si le champ est vide (gestion faite par `required`)
                  }
                  if (livreNonDispo.includes(value)) {
                    return Promise.reject(new Error('livre pas disponible'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Select
              showSearch
              allowClear
              filterOption={false}
              optionLabelProp="label"
              options={optionsLiv}
              loading={livresLoading}
              onSearch={fetchLivreSuggestions} // Appelé lors de la saisie
              placeholder="Tapez pour rechercher..."
            />
          </Form.Item>

          <Form.Item label="Date Emprunt" name="date_emprunt" rules={[{ required: true, message: "Veuillez entrer la date d'inscription !" }]}>
            <DatePicker defaultValue={today} onChange={handleDateChange}/>
          </Form.Item>

          <Form.Item label="Date Retour" name="date_retour" rules={[{ required: true, message: 'Veuillez entrer la date de naissance !' }]}>
            <DatePicker defaultValue={afterFourteenDay} disabled/>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button color="primary" htmlType="reset" variant='outlined'>Réinitialiser</Button>
            <Button type="primary" htmlType="submit">Soumettre</Button>
          </Form.Item>

        </Form>
      </div>
    </div>
  );
}

export default AjoutPersonne;
