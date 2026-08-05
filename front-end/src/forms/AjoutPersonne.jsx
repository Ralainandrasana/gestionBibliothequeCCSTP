import { Button, Input, Form, DatePicker, Upload, message } from 'antd';
import { RightOutlined, HomeOutlined, UploadOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const onFinish = async (values, navigate) => {
  const formData = new FormData();

  Object.keys(values).forEach((key) => {
    if (key === 'photo') {
      // Check if the photo field is defined and has files
      if (values.photo && values.photo.length > 0) {
        formData.append('photo', values.photo[0].originFileObj); // Add the photo if it exists
      } else {
        formData.append('photo', null); // Set photo to null if no file is uploaded
      }
    } else if (key === 'date_nais' || key === 'date_inscription') {
      // Format the date in 'YYYY-MM-DD'
      formData.append(key, values[key].format('YYYY-MM-DD'));
    } else {
      // Add other fields
      formData.append(key, values[key]);
    }
  });

  try {
    const response = await axios.post('http://localhost:3000/api/crud/personnes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Formulaire soumis avec succès :', response.data);
    message.success('Ajout avec succès !'); // Show success message
    navigate('/adherent/personne'); // Redirect to the specified route
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
  const [matricule, setMatricule] = useState([]);


  // Fonction pour rechercher les matricules depuis la base de données
  const fetchMatricule = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/other/matricule`);
        
        // Inclure à la fois 'id' et 'tri' pour pouvoir utiliser id lors de la sélection
        const matricules = response.data.map(item => item.code);
        setMatricule(matricules);
      } catch (error) {
        console.error("Erreur lors de la récupération des matricule :", error);
      }
  };
  //
   useEffect(() => {
    fetchMatricule();
    }, []);

    console.log(matricule.length)
  return (
    <div className='component'>
      <div className="rout">
        <div className="icon">
          <HomeOutlined style={{ fontSize: '12px', color: '#061C6B' }} />
        </div>
        <div className="icon">
          <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin: '0 4px' }} />
        </div>
        <p>Adherent</p>
        <div className="icon">
          <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin: '0 4px' }} />
        </div>
        <p>Personne</p>
        <div className="icon">
          <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin: '0 4px' }} />
        </div>
        <p>Ajout Personne</p>
      </div>

      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">Ajout Personne</h2>
        </div>
      </div>

        <div className="form person-add-form responsive-add-form">
          <Form
            className="person-add-form-inner responsive-add-form-inner"
            name="basic"
            labelCol={{
              xs: { span: 24 },
              sm: { span: 6 },
              md: { span: 4 },
              lg: { span: 3 },
            }}
            wrapperCol={{
              xs: { span: 24 },
              sm: { span: 18 },
              md: { span: 16 },
              lg: { span: 10 },
            }}
          initialValues={{ remember: true }}
          onFinish={(values) => onFinish(values, navigate)} // Pass navigate to onFinish
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Matricule"
            name="code"
            rules={[
              { required: true, message: 'Veuillez entrer le matricule !' },
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.resolve(); // Pas d'erreur si le champ est vide (gestion faite par `required`)
                  }
                  if (matricule.includes(value)) {
                    return Promise.reject(new Error('Le matricule existe déjà !'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input />
          </Form.Item>


          <Form.Item label="Nom" name="nom" rules={[{ required: true, message: 'Veuillez entrer le nom !' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Prenom" name="prenom" rules={[{ required: true, message: 'Veuillez entrer le prénom !' }]}>
            <Input />
          </Form.Item>

          <Form.Item
            label="CIN"
            name="CIN"
            rules={[
              {
                pattern: /^\d{12}$/,
                message: 'Le CIN doit contenir exactement 12 chiffres.',
              },
            ]}
          >
            <Input />
          </Form.Item>


          <Form.Item label="Adresse" name="adresse" rules={[{ required: true, message: 'Veuillez entrer l\'adresse !' }]}>
            <Input.TextArea />
          </Form.Item>

          <Form.Item label="Profession" name="profession" rules={[{ required: true, message: 'Veuillez entrer la profession !' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Departement" name="departement" rules={[{ required: true, message: 'Veuillez entrer le département !' }]}>
            <Input />
          </Form.Item>

          <Form.Item 
            label="Tel" 
            name="tel" 
            rules={[
              { required: true, message: 'Veuillez entrer le numéro de téléphone !' 
              },
              {
                pattern: /^\d{10}$/,
                message: 'Le numero telephone doit contenir exactement 10 chiffres.'
              }
              ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Inscrit le" name="date_inscription" rules={[{ required: true, message: 'Veuillez entrer la date d\'inscription !' }]}>
            <DatePicker />
          </Form.Item>

          <Form.Item label="Photo" name="photo" valuePropName="fileList" getValueFromEvent={(e) => e && e.fileList}>
            <Upload
              listType="picture"
              maxCount={1}
              accept="image/*"
              beforeUpload={() => false}
            >
              <Button type="primary" icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>

          <Form.Item label="Né(e) le" name="date_nais" rules={[{ required: true, message: 'Veuillez entrer la date de naissance !' }]}>
            <DatePicker />
          </Form.Item>

          <Form.Item label="à" name="lieu" rules={[{ required: true, message: 'Veuillez entrer le lieu de naissance !' }]}>
            <Input />
          </Form.Item>

            <Form.Item
              className="person-add-form-actions responsive-add-form-actions"
              wrapperCol={{
                xs: { span: 24 },
                sm: { offset: 6, span: 18 },
                md: { offset: 4, span: 16 },
                lg: { offset: 3, span: 10 },
              }}
            >
            <Button color="primary" htmlType="reset" variant='outlined'>Réinitialiser</Button>
            <Button type="primary" htmlType="submit">Soumettre</Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default AjoutPersonne;
