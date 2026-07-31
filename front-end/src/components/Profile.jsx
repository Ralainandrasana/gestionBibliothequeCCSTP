import { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Form,
  Input,
  message,
  Tag,
  Upload,
} from 'antd';
import {
  EditOutlined,
  HomeOutlined,
  IdcardOutlined,
  LockOutlined,
  MailOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { normalizeRole, ROLES } from '../config/accessControl';

const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

const roleLabels = {
  [ROLES.ADMIN]: 'Administrateur',
  [ROLES.USER]: 'Utilisateur',
  [ROLES.INVITER]: 'Invité',
};

const statusLabels = {
  active: 'Actif',
  pending: 'En attente',
  blocked: 'Bloqué',
};

function Profile() {
  const { user, api, refreshUser } = useAuth();
  const [activeSection, setActiveSection] = useState('details');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    if (!user) return;
    profileForm.setFieldsValue({
      nom: user.nom,
      email: user.email,
      photo: user.photo
        ? [{ uid: 'current-profile-photo', name: 'Photo actuelle', status: 'done', url: user.photo }]
        : [],
    });
  }, [profileForm, user]);

  const primaryRole = normalizeRole(String(user?.roles || '').split(',')[0]);
  const roleLabel = roleLabels[primaryRole] || primaryRole || 'Utilisateur';
  const normalizedStatus = String(user?.account_status || '').toLowerCase();
  const statusLabel = statusLabels[normalizedStatus] || normalizedStatus || 'Non défini';
  const displayName = user?.prenom || user?.nom || 'Utilisateur';
  const initial = displayName.charAt(0).toUpperCase();

  const handleProfileSave = async (values) => {
    const formData = new FormData();
    formData.append('nom', values.nom.trim());
    formData.append('email', values.email.trim());

    const selectedPhoto = values.photo?.[0]?.originFileObj;
    if (selectedPhoto) {
      formData.append('photo', selectedPhoto);
    } else if (user.photo) {
      formData.append('photo', user.photo);
    }

    setSavingProfile(true);
    try {
      const response = await api.put('/auth/profile', formData);
      await refreshUser();
      message.success(response.data.message || 'Profil mis à jour avec succès.');
    } catch (error) {
      message.error(error.response?.data?.message || 'Impossible de mettre à jour le profil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (values) => {
    setSavingPassword(true);
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      passwordForm.resetFields();
      message.success(response.data.message || 'Mot de passe modifié avec succès.');
    } catch (error) {
      message.error(error.response?.data?.message || 'Impossible de modifier le mot de passe.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="component profile-page">
      <div className="rout">
        <div className="icon">
          <HomeOutlined style={{ fontSize: '12px', color: '#061C6B' }} />
        </div>
        <div className="icon">
          <RightOutlined style={{ fontSize: '10px', color: '#061C6B', margin: '0 4px' }} />
        </div>
        <p>Mon profil</p>
      </div>

      <section className="profile-hero">
        <div className="profile-hero-avatar">
          <Avatar size={104} src={user?.photo} icon={!user?.photo && <UserOutlined />}>
            {!user?.photo && initial}
          </Avatar>
        </div>
        <div className="profile-hero-copy">
          <span>Mon espace personnel</span>
          <h1>{displayName}</h1>
          <p>{user?.email}</p>
        </div>
        <div className="profile-hero-badges">
          <Tag className="profile-role-tag">{roleLabel}</Tag>
          <Tag className={`profile-status-tag status-${normalizedStatus}`}>{statusLabel}</Tag>
        </div>
      </section>

      <div className="profile-workspace">
        <aside className="profile-submenu" aria-label="Navigation du profil">
          <div className="profile-submenu-title">Mon compte</div>
          <button
            type="button"
            className={activeSection === 'details' ? 'active' : ''}
            onClick={() => setActiveSection('details')}
          >
            <IdcardOutlined />
            <span>Détail du compte</span>
          </button>
          <button
            type="button"
            className={activeSection === 'edit' ? 'active' : ''}
            onClick={() => setActiveSection('edit')}
          >
            <EditOutlined />
            <span>Modifier le compte</span>
          </button>
        </aside>

        <main className="profile-panel">
          {activeSection === 'details' ? (
            <>
              <div className="profile-panel-heading">
                <div>
                  <span className="profile-eyebrow">Vue d’ensemble</span>
                  <h2>Détail du compte</h2>
                  <p>Les informations actuellement associées à votre compte.</p>
                </div>
              </div>

              <div className="profile-detail-grid">
                <div className="profile-detail-item">
                  <div className="profile-detail-icon"><UserOutlined /></div>
                  <div><span>Nom d’utilisateur</span><strong>{user?.nom || '—'}</strong></div>
                </div>
                <div className="profile-detail-item">
                  <div className="profile-detail-icon"><MailOutlined /></div>
                  <div><span>Adresse email</span><strong>{user?.email || '—'}</strong></div>
                </div>
                <div className="profile-detail-item">
                  <div className="profile-detail-icon"><SafetyCertificateOutlined /></div>
                  <div><span>Rôle</span><strong>{roleLabel}</strong></div>
                </div>
                <div className="profile-detail-item">
                  <div className="profile-detail-icon"><IdcardOutlined /></div>
                  <div><span>Statut du compte</span><strong>{statusLabel}</strong></div>
                </div>
              </div>

              <div className="profile-readonly-note">
                <SafetyCertificateOutlined />
                <div>
                  <strong>Informations protégées</strong>
                  <p>Le rôle et le statut du compte sont gérés par l’administrateur système.</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="profile-panel-heading">
                <div>
                  <span className="profile-eyebrow">Personnalisation</span>
                  <h2>Modifier le compte</h2>
                  <p>Mettez à jour vos informations personnelles et votre sécurité.</p>
                </div>
              </div>

              <section className="profile-form-section">
                <div className="profile-section-title">
                  <UserOutlined />
                  <div><h3>Informations personnelles</h3><p>Nom, email et photo de profil.</p></div>
                </div>
                <Form
                  form={profileForm}
                  layout="vertical"
                  className="profile-form"
                  onFinish={handleProfileSave}
                >
                  <div className="profile-form-grid">
                    <Form.Item
                      label="Nom d’utilisateur"
                      name="nom"
                      rules={[{ required: true, whitespace: true, message: 'Veuillez entrer votre nom.' }]}
                    >
                      <Input prefix={<UserOutlined />} />
                    </Form.Item>
                    <Form.Item
                      label="Adresse email"
                      name="email"
                      rules={[
                        { required: true, message: 'Veuillez entrer votre email.' },
                        { type: 'email', message: 'Adresse email invalide.' },
                      ]}
                    >
                      <Input prefix={<MailOutlined />} />
                    </Form.Item>
                  </div>
                  <Form.Item
                    label="Photo de profil"
                    name="photo"
                    valuePropName="fileList"
                    getValueFromEvent={(event) => event?.fileList}
                  >
                    <Upload listType="picture" maxCount={1} accept="image/*" beforeUpload={() => false}>
                      <Button icon={<UploadOutlined />}>Choisir une image</Button>
                    </Upload>
                  </Form.Item>
                  <div className="profile-form-actions">
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={savingProfile}>
                      Enregistrer les informations
                    </Button>
                  </div>
                </Form>
              </section>

              <section className="profile-form-section profile-security-section">
                <div className="profile-section-title">
                  <LockOutlined />
                  <div><h3>Sécurité</h3><p>Choisissez un mot de passe difficile à deviner.</p></div>
                </div>
                <Form
                  form={passwordForm}
                  layout="vertical"
                  className="profile-form"
                  onFinish={handlePasswordSave}
                >
                  <div className="profile-form-grid profile-password-grid">
                    <Form.Item
                      label="Mot de passe actuel"
                      name="currentPassword"
                      rules={[{ required: true, message: 'Veuillez entrer votre mot de passe actuel.' }]}
                    >
                      <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>
                    <Form.Item
                      label="Nouveau mot de passe"
                      name="newPassword"
                      rules={[
                        { required: true, message: 'Veuillez entrer un nouveau mot de passe.' },
                        {
                          pattern: PASSWORD_PATTERN,
                          message: '6 caractères minimum avec une majuscule, un nombre et un symbole.',
                        },
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>
                    <Form.Item
                      label="Confirmer le mot de passe"
                      name="confirmPassword"
                      dependencies={['newPassword']}
                      rules={[
                        { required: true, message: 'Veuillez confirmer le nouveau mot de passe.' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            return !value || getFieldValue('newPassword') === value
                              ? Promise.resolve()
                              : Promise.reject(new Error('Les mots de passe ne correspondent pas.'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>
                  </div>
                  <div className="profile-form-actions">
                    <Button type="primary" htmlType="submit" icon={<LockOutlined />} loading={savingPassword}>
                      Modifier le mot de passe
                    </Button>
                  </div>
                </Form>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Profile;
