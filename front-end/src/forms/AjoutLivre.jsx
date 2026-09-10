import { Button, Input, Form, DatePicker, Select, message } from 'antd';
import { RightOutlined, HomeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Colonnes NOT NULL en base : un champ laissé vide doit partir en chaîne vide.
// Les autres champs facultatifs sont omis afin d'être enregistrés à NULL.
const CHAMPS_NON_NULLABLES = ['editeur', 'etat'];

const onFinish = async (values, navigate) => {
  const formData = new FormData();

  Object.keys(values).forEach((key) => {
    const value = values[key];

    // Ne pas transmettre "undefined" pour un champ facultatif laissé vide.
    if (value === undefined || value === null || value === '') {
      if (CHAMPS_NON_NULLABLES.includes(key)) {
        formData.append(key, '');
      }
      return;
    }

    if (key === 'date_status') {
      // Format the date in 'YYYY-MM-DD'
      formData.append(key, value.format('YYYY-MM-DD'));
    } else {
      // Add other fields
      formData.append(key, value);
    }
  });

  try {
    const response = await axios.post('/api/crud/livres', formData, {
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
          <Form.Item label="Type" name="Type" rules={[{ required: true, message: 'Veuillez choisir le type !' }]}>
              <Select defaultValue={"type"}>
                <Select.Option value="Livre">Livre</Select.Option>
                <Select.Option value="Usuelle">Usuelle</Select.Option>
                <Select.Option value="Périodique">Périodique</Select.Option>
              </Select>
          </Form.Item>

          <Form.Item label="Titre" name="titre" rules={[{ required: true, message: 'Veuillez entrer le titre !' }]}>
            <Input.TextArea />
          </Form.Item>

          <Form.Item label="Sous Titre" name="sous_titre">
            <Input.TextArea />
          </Form.Item>

          <Form.Item label="Auteur" name="auteur" rules={[{ required: true, message: 'Veuillez entrer l\'auteur !' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Editeur" name="editeur">
            <Input />
          </Form.Item>

          <Form.Item label="Deway" name="deway" rules={[{ required: true, message: 'Veuillez entrer le Deway !' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Cote" name="cote" rules={[{ required: true, message: 'Veuillez entrer la cote !' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Isbn" name="ISBN">
            <Input />
          </Form.Item>

          <Form.Item label="Langue Pays" name="langue_pays">
            <Input />
          </Form.Item>

          <Form.Item label="Dimension" name="dimension">
            <Input />
          </Form.Item>

          <Form.Item label="Nbre Page" name="nbre_page">
            <Input />
          </Form.Item>

          <Form.Item label="Etat" name="etat">
              <Select defaultValue={"Etat"}>
                <Select.Option value="Neuf">Neuf</Select.Option>
                <Select.Option value="Bon">Bon</Select.Option>
                <Select.Option value="Mauvais">Mauvais</Select.Option>
              </Select>
          </Form.Item>

          <Form.Item label="Status" name="status">
          <Select defaultValue={"Status"}>
                <Select.Option value="OK">OK</Select.Option>
                <Select.Option value="Pilonner">Pilonner</Select.Option>
                <Select.Option value="Perdu">Perdu</Select.Option>
              </Select>
          </Form.Item>

          <Form.Item label="Date Status" name="date_status">
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
