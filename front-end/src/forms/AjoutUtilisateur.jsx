import { Button, Form, Input, message, Select, Upload } from 'antd';
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  HomeOutlined,
  RightOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../config/accessControl';

const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

function AjoutUtilisateur() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append('nom', values.nom.trim());
    formData.append('pswd', values.pswd);
    formData.append('email', values.email.trim());
    formData.append('roles', values.roles);
    formData.append('account_status', values.account_status);
    formData.append('user_role_id', values.user_role_id);
    formData.append('photo', values.photo[0].originFileObj);

    setSubmitting(true);
    try {
      await axios.post('http://localhost:3000/api/crud/register', formData);
      message.success('Utilisateur ajouté avec succès !');
      navigate('/Parametre/Administrateur/User');
    } catch (error) {
      message.error(
        error.response?.data?.message ||
        'Erreur lors de l’ajout de l’utilisateur, veuillez réessayer.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="component">
      <div className="rout">
        <div className="icon">
          <HomeOutlined style={{ fontSize: '12px', color: '#061C6B' }} />
        </div>
        <div className="icon">
          <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin: '0 4px' }} />
        </div>
        <p>Paramètre</p>
        <div className="icon">
          <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin: '0 4px' }} />
        </div>
        <p>Administrateur</p>
        <div className="icon">
          <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin: '0 4px' }} />
        </div>
        <p>Gestion utilisateur</p>
        <div className="icon">
          <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin: '0 4px' }} />
        </div>
        <p>Ajout utilisateur</p>
      </div>

      <div className="bouton">
        <div className="left">
          <h2 className="titreTable">Ajout Utilisateur</h2>
        </div>
      </div>

      <div className="form">
        <Form
          form={form}
          name="ajout-utilisateur"
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 10 }}
          initialValues={{
            roles: ROLES.USER,
            account_status: 'active',
            user_role_id: 2,
          }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Nom"
            name="nom"
            rules={[{ required: true, whitespace: true, message: 'Veuillez entrer le nom !' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="pswd"
            rules={[
              { required: true, message: 'Veuillez entrer le mot de passe !' },
              {
                pattern: PASSWORD_PATTERN,
                message: '6 caractères minimum avec une majuscule, un nombre et un symbole.',
              },
            ]}
            extra="6 caractères minimum, avec une lettre capitale, un nombre et un symbole."
            hasFeedback
          >
            <Input.Password
              iconRender={(visible) => visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="Confirm password"
            name="confirm_password"
            dependencies={['pswd']}
            hasFeedback
            rules={[
              { required: true, message: 'Veuillez confirmer le mot de passe !' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('pswd') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Les deux mots de passe ne correspondent pas.'));
                },
              }),
            ]}
          >
            <Input.Password
              iconRender={(visible) => visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Veuillez entrer l’adresse email !' },
              { type: 'email', message: 'Veuillez entrer une adresse email valide.' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Photo"
            name="photo"
            valuePropName="fileList"
            getValueFromEvent={(event) => event?.fileList}
            rules={[{ required: true, message: 'Veuillez sélectionner une photo !' }]}
          >
            <Upload
              listType="picture"
              maxCount={1}
              accept="image/*"
              beforeUpload={() => false}
            >
              <Button type="primary" icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Roles"
            name="roles"
            rules={[{ required: true, message: 'Veuillez sélectionner un rôle !' }]}
          >
            <Select
              onChange={(role) => form.setFieldValue('user_role_id', role === ROLES.ADMIN ? 1 : 2)}
              options={[
                { value: ROLES.ADMIN, label: 'Administrator' },
                { value: ROLES.USER, label: 'User' },
                { value: ROLES.INVITER, label: 'Inviter' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Account Status"
            name="account_status"
            rules={[{ required: true, message: 'Veuillez sélectionner le statut du compte !' }]}
          >
            <Select
              options={[
                { value: 'active', label: 'Active' },
                { value: 'pending', label: 'Pending' },
                { value: 'blocked', label: 'Blocked' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="User Role Id"
            name="user_role_id"
            rules={[{ required: true, message: 'Veuillez sélectionner le User Role Id !' }]}
          >
            <Select
              options={[
                { value: 1, label: 'Administrator' },
                { value: 2, label: 'User' },
              ]}
            />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button
              color="primary"
              variant="outlined"
              onClick={() => form.resetFields()}
              disabled={submitting}
            >
              Réinitialiser
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Soumettre
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default AjoutUtilisateur;
