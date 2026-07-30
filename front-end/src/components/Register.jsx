import { useState } from 'react';
import { Button, Form, Input, message, Select, Upload } from 'antd';
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../config/accessControl';

const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
const PENDING_ACCOUNT_MESSAGE =
  "Votre compte n'est pas actif. Veuillez contacter l'administrateur système pour plus d'informations";

function Register() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { api } = useAuth();

  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append('nom', values.nom.trim());
    formData.append('pswd', values.pswd);
    formData.append('email', values.email.trim());
    formData.append('roles', ROLES.INVITER);
    formData.append('user_role_id', 2);
    formData.append('photo', values.photo[0].originFileObj);

    setSubmitting(true);
    try {
      await api.post('/auth/register', formData);
      navigate('/login', {
        replace: true,
        state: { registrationMessage: PENDING_ACCOUNT_MESSAGE },
      });
    } catch (error) {
      message.error(
        error.response?.data?.message ||
        'Erreur lors de l’inscription, veuillez réessayer.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="register-page">
      <header className="register-header">
        <Link to="/login" className="register-brand" aria-label="Retour à la connexion">
          <img src="/image/logoSaintPaul.png" alt="Logo CCStP" />
          <span>CCStP</span>
        </Link>

        <div className="register-login-link">
          <span>Vous avez déjà un compte ?</span>
          <Link to="/login">S’identifier</Link>
        </div>
      </header>

      <section className="register-content">
        <div className="register-card">
          <div className="register-title">
            <h1>Créer un compte</h1>
            <p>Renseignez vos informations pour envoyer votre demande d’inscription.</p>
          </div>

          <Form
            form={form}
            name="inscription-publique"
            layout="vertical"
            initialValues={{
              roles: ROLES.INVITER,
              user_role_id: 2,
            }}
            onFinish={onFinish}
            autoComplete="off"
            className="register-form"
          >
            <div className="register-form-grid">
              <Form.Item
                label="Nom"
                name="nom"
                rules={[{ required: true, whitespace: true, message: 'Veuillez entrer votre nom !' }]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Veuillez entrer votre adresse email !' },
                  { type: 'email', message: 'Veuillez entrer une adresse email valide.' },
                ]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="pswd"
                rules={[
                  { required: true, message: 'Veuillez entrer votre mot de passe !' },
                  {
                    pattern: PASSWORD_PATTERN,
                    message: '6 caractères minimum avec une majuscule, un nombre et un symbole.',
                  },
                ]}
                extra="6 caractères minimum, avec une lettre capitale, un nombre et un symbole."
                hasFeedback
              >
                <Input.Password
                  size="large"
                  iconRender={(visible) => visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                />
              </Form.Item>

              <Form.Item
                label="Confirm password"
                name="confirm_password"
                dependencies={['pswd']}
                hasFeedback
                rules={[
                  { required: true, message: 'Veuillez confirmer votre mot de passe !' },
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
                  size="large"
                  iconRender={(visible) => visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                />
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

              <Form.Item label="Roles" name="roles">
                <Select
                  size="large"
                  disabled
                  options={[{ value: ROLES.INVITER, label: 'Inviter' }]}
                />
              </Form.Item>

              <Form.Item label="User Role Id" name="user_role_id">
                <Select
                  size="large"
                  disabled
                  options={[{ value: 2, label: 'User' }]}
                />
              </Form.Item>
            </div>

            <div className="register-actions">
              <Button
                size="large"
                onClick={() => form.resetFields()}
                disabled={submitting}
              >
                Réinitialiser
              </Button>
              <Button type="primary" size="large" htmlType="submit" loading={submitting}>
                S’inscrire
              </Button>
            </div>
          </Form>
        </div>
      </section>
    </main>
  );
}

export default Register;
