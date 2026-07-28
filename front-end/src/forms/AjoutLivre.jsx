import { Button, Input, Form, DatePicker, Select, message } from 'antd';
import { RightOutlined, HomeOutlined, UploadOutlined } from '@ant-design/icons';
import React from 'react';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const onFinish = async (values, navigate) => {
  const formData = new FormData();

  Object.keys(values).forEach((key) => {
    if (key === 'date_status') {
      // Format the date in 'YYYY-MM-DD'
      formData.append(key, values[key].format('YYYY-MM-DD'));
    } else {
      // Add other fields
      formData.append(key, values[key]);
    }
  });

  try {
    const response = await axios.post('http://localhost:3000/api/crud/livres', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Formulaire soumis avec succès :', response.data);
    message.success('Ajout avec succès !'); // Show success message
    navigate('/GestionBibliotheque/EtatDesLivres'); // Redirect to the specified route
  } catch (error) {
    console.log('Erreur lors de la soumission du formulaire :', error);
    message.error('Erreur lors de l\'ajout, veuillez réessayer.'); // Show error message
  }
};



const onFinishFailed = (errorInfo) => {
  console.log('Échec de la soumission du formulaire :', errorInfo);
};

function AjoutPersonne() {
  const navigate = useNavigate(); // Initialize navigate

  return (
    <div className='component'>
      <div className="rout">
        <div className="icon">
          <HomeOutlined style={{ fontSize: '12px', color: '#061C6B' }} />
        </div>
        <div className="icon">
          <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin: '0 4px' }} />
        </div>
        <p>GestionBibliotheque</p>
        <div className="icon">
          <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin: '0 4px' }} />
        </div>
        <p>Etat des livres</p>
        <div className="icon">
          <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin: '0 4px' }} />
        </div>
        <p>Ajout Livre</p>
      </div>

      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">Ajout Livre</h2>
        </div>
      </div>

      <div className="form">
        <Form
          name="basic"
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 10 }}
          initialValues={{ remember: true }}
          onFinish={(values) => onFinish(values, navigate)} // Pass navigate to onFinish
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item label="Type" name="Type" rules={[{ required: true, message: 'Veuillez entrer le matricule !' }]}>
              <Select defaultValue={"type"}>
                <Select.Option value="Livre">Livre</Select.Option>
                <Select.Option value="Usuelle">Usuelle</Select.Option>
                <Select.Option value="Périodique">Périodique</Select.Option>
              </Select>
          </Form.Item>

          <Form.Item label="Titre" name="titre" rules={[{ required: true, message: 'Veuillez entrer le nom !' }]}>
            <Input.TextArea />
          </Form.Item>

          <Form.Item label="Sous Titre" name="sous_titre" rules={[{ required: true, message: 'Veuillez entrer le prénom !' }]}>
            <Input.TextArea />
          </Form.Item>

          <Form.Item label="Auteur" name="auteur" rules={[{ required: true, message: 'Veuillez entrer le CIN !' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Editeur" name="editeur" rules={[{ required: true, message: 'Veuillez entrer l\'adresse !' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Deway" name="deway" rules={[{ required: true, message: 'Veuillez entrer la profession !' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Cote" name="cote" rules={[{ required: true, message: 'Veuillez entrer le département !' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Isbn" name="ISBN" rules={[{ required: true, message: 'Veuillez entrer le numéro de téléphone !' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Langue Pays" name="langue_pays" rules={[{ required: true, message: 'Veuillez entrer le numéro de téléphone !' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Dimension" name="dimension" rules={[{ required: true, message: 'Veuillez entrer le numéro de téléphone !' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Nbre Page" name="nbre_page" rules={[{ required: true, message: 'Veuillez entrer le numéro de téléphone !' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Etat" name="etat" rules={[{ required: true, message: 'Veuillez entrer le numéro de téléphone !' }]}>
              <Select defaultValue={"Etat"}>
                <Select.Option value="Neuf">Neuf</Select.Option>
                <Select.Option value="Bon">Bon</Select.Option>
                <Select.Option value="Mauvais">Mauvais</Select.Option>
              </Select>
          </Form.Item>

          <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Veuillez entrer le numéro de téléphone !' }]}>
          <Select defaultValue={"Status"}>
                <Select.Option value="OK">OK</Select.Option>
                <Select.Option value="Pilonner">Pilonner</Select.Option>
                <Select.Option value="Perdu">Perdu</Select.Option>
              </Select>
          </Form.Item>

          <Form.Item label="Date Status" name="date_status" rules={[{ required: true, message: 'Veuillez entrer la date d\'inscription !' }]}>
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
