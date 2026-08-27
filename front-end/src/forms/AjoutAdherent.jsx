import { Button, Form, DatePicker, Select, message } from 'antd';
import { RightOutlined, HomeOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import useDebouncedRemoteOptions from '../hooks/useDebouncedRemoteOptions';

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
    const response = await axios.post('/api/crud/adherents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Formulaire soumis avec succès :', response.data);//ji
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
  const {
    options,
    loading: suggestionsLoading,
    search: fetchMatriculeSuggestions,
  } = useDebouncedRemoteOptions({
    endpoint: '/api/other/autoCompletePersonnes',
    valueKey: 'id',
    labelKey: 'tri',
  });
  const [form] = Form.useForm(); // Utilisez l'instance form
  const today = dayjs();
  const oneYearLater = today.add(1, "year");

  const handleDateChange = (date) =>{
    if(date){
      const dateFin = dayjs(date).add(1, "year");
      form.setFieldsValue({date_fin: dateFin});
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
        <p>Adherent</p>
        <div className="icon">
          <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin: '0 4px' }} />
        </div>
        <p>Personne</p>
        <div className="icon">
          <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin: '0 4px' }} />
        </div>
        <p>Ajout Adherent</p>
      </div>

      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">Ajout Adherent</h2>
        </div>
      </div>

      <div className="form">
        <Form
          form={form} // Associez l'instance form au formulaire
          name="basic"
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 10 }}
          initialValues={{ 
            remember: true,
            date_reinscription: today,
            date_fin: oneYearLater  }}
          onFinish={(values) => onFinish(values, navigate)} // Pass navigate to onFinish
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item label="categorie" name="categorie" rules={[{ required: true, message: 'Veuillez entrer le categorie !' }]}>
            <Select defaultValue={"categorie"}>
              <Select.Option value="Enfant">Enfant</Select.Option>
              <Select.Option value="Jeune">Jeune</Select.Option>
              <Select.Option value="Adulte">Adulte</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Inscrit le" name="date_reinscription" rules={[{ required: true, message: "Veuillez entrer la date d'inscription !" }]}>
            <DatePicker defaultValue={today} onChange={handleDateChange}/>
          </Form.Item>

          <Form.Item label="fin" name="date_fin" rules={[{ required: true, message: 'Veuillez entrer la date de naissance !' }]}>
            <DatePicker disabled defaultValue={oneYearLater}/>
          </Form.Item>

          {/* <Form.Item label="type_d_adhesion" name="type">
            <Input value="Livre" readOnly />
          </Form.Item> */}

          <Form.Item
            label="Personne"
            name="id_pers"
            rules={[{ required: true, message: 'Veuillez entrer le personne !' }]}
          >
            <Select
              showSearch
              allowClear
              filterOption={false}
              optionLabelProp="label"
              options={options}
              loading={suggestionsLoading}
              onSearch={fetchMatriculeSuggestions} // Appelé lors de la saisie
              placeholder="Tapez pour rechercher..."
            />
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
