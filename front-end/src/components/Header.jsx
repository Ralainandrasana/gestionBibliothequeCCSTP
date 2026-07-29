import React from 'react';
import { DownOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Avatar } from 'antd';
import { useAuth } from '../context/AuthContext';
import { normalizeRole, ROLES } from '../config/accessControl';

function Header({ onLogout }) {
  const { user } = useAuth();

  // Menu de déconnexion
  const menu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profil
      </Menu.Item>
      <Menu.Item key="logout" onClick={onLogout} icon={<LogoutOutlined />}>
        Déconnexion
      </Menu.Item>
    </Menu>
  );

  // Fonction pour obtenir les initiales de l'utilisateur
  const getInitials = () => {
    if (!user) return 'U';
    const nom = user.nom || '';
    const prenom = user.prenom || '';
    if (prenom && nom) {
      return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
    }
    return nom.charAt(0).toUpperCase() || 'U';
  };

  // Fonction pour obtenir le nom complet
  const getFullName = () => {
    if (!user) return 'Utilisateur';
    if (user.prenom && user.nom) {
      return `${user.prenom} ${user.nom}`;
    }
    return user.nom || user.username || 'Utilisateur';
  };

  // Fonction pour obtenir le rôle affiché
  const getRoleDisplay = () => {
    if (!user) return 'Utilisateur';
    const roles = user.roles || 'user';
    const roleMap = {
      [ROLES.ADMIN]: 'Administrateur',
      'bibliothecaire': 'Bibliothécaire',
      [ROLES.USER]: 'Utilisateur',
      [ROLES.INVITER]: 'Invité'
    };
    // Si plusieurs rôles, prendre le premier
    const firstRole = normalizeRole(roles.split(',')[0]);
    return roleMap[firstRole] || firstRole || 'Utilisateur';
  };

  // Fonction pour obtenir la photo de profil
  const getAvatar = () => {
    if (user?.photo) {
      return <Avatar src={user.photo} size={40} />;
    }
    return (
      <Avatar style={{ backgroundColor: '#215CDE' }} size={40}>
        {getInitials()}
      </Avatar>
    );
  };

  return (
    <div style={{ background: 'white', color: '#215CDE' }} className="header">
      <div className="logo">
        <div className="logoCCSP">
          <img src="/image/logoSaintPaul.png" alt="logoCCSP" />
        </div>
        <div className="textCCSP">
          <h1>CCStP</h1>
        </div>
      </div>
      <div className="user">
        <div className="photo">
          {getAvatar()}
        </div>
        <Dropdown overlay={menu} trigger={['click']} className='logout'>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="nomEtRole">
              <h5 style={{ margin: 0 }}>{getFullName()}</h5>
              <h6 style={{ margin: 0, color: '#888', fontSize: '12px' }}>{getRoleDisplay()}</h6>
            </div>
            <div className="arrowDown">
              <DownOutlined />
            </div>
          </div>
        </Dropdown>
      </div>
    </div>
  );
}

export default Header;
