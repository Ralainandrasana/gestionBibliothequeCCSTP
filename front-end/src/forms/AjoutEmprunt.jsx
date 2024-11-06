import { Button, Input, Form, DatePicker, Select, message, AutoComplete } from 'antd';
import { RightOutlined, HomeOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const onFinish = async (values, navigate) => {
  const formData = new FormData();
  console.log("Données du formulaire :", values);

  Object.keys(values).forEach((key) => {
    if (key === 'date_fin' || key === 'date_reinscription') {
      formData.append(key, values[key].format('YYYY-MM-DD'));
    } else {
      formData.append(key, values[key]);
    }
  });
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }
  

  try {
    const response = await axios.post('http://localhost:3000/api/crud/adherents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Formulaire soumis avec succès :', response.data);
    message.success('Ajout avec succès !'); // Show success message
    navigate('/adherent/adherent'); // Redirect to the specified route
  } catch (error) {
    console.log('Erreur lors de la soumission du formulaire :', error);
    message.error("Erreur lors de l'ajout, veuillez réessayer."); // Show error message
  }
};

const onFinishFailed = (errorInfo) => {
  console.log('Échec de la soumission du formulaire :', errorInfo);
};

function AjoutPersonne() {
  const navigate = useNavigate(); // Initialize navigate
  const [options, setOptions] = useState([]);
  const [form] = Form.useForm(); // Utilisez l'instance form
  const today = moment();

  // Fonction pour rechercher les matricules depuis la base de données
  const fetchMatriculeSuggestions = async (query) => {
    if (query) {
      try {
        const response = await axios.get(`http://localhost:3000/api/other/autoCompletePersonnes?search=${query}`);
        
        // Inclure à la fois 'id' et 'tri' pour pouvoir utiliser id lors de la sélection
        const matricules = response.data.map((personne) => ({
          label: personne.tri, // Utilisé pour l'affichage
          value: personne.id,  // Utilisé pour le stockage
        }));
        setOptions(matricules);
      } catch (error) {
        console.error("Erreur lors de la récupération des suggestions :", error);
      }
    } else {
      setOptions([]); // Réinitialise les options si le champ est vide
    }
  };

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
          initialValues={{ remember: true }}
          onFinish={(values) => onFinish(values, navigate)} // Pass navigate to onFinish
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >

          <Form.Item
            label="Adherent"
            name="id_pers"
            rules={[{ required: true, message: 'Veuillez entrer le personne !' }]}
          >
            <AutoComplete
              options={options}
              onSearch={fetchMatriculeSuggestions} // Appelé lors de la saisie
              onSelect={(value) => {
                // Met à jour le champ avec l'id sélectionné
                form.setFieldsValue({ id_pers: value });
              }}
              placeholder="Tapez pour rechercher..."
            >
              <Input />
            </AutoComplete>
          </Form.Item>

          <Form.Item
            label="Livre"
            name="id_pers"
            rules={[{ required: true, message: 'Veuillez entrer le personne !' }]}
          >
            <AutoComplete
              options={options}
              onSearch={fetchMatriculeSuggestions} // Appelé lors de la saisie
              onSelect={(value) => {
                // Met à jour le champ avec l'id sélectionné
                form.setFieldsValue({ id_pers: value });
              }}
              placeholder="Tapez pour rechercher..."
            >
              <Input />
            </AutoComplete>
          </Form.Item>

          <Form.Item label="Date Emprunt" name="date_reinscription" rules={[{ required: true, message: "Veuillez entrer la date d'inscription !" }]}>
            <DatePicker />
          </Form.Item>

          <Form.Item label="Date Retour" name="date_fin" rules={[{ required: true, message: 'Veuillez entrer la date de naissance !' }]}>
            <DatePicker />
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
