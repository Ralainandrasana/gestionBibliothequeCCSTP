import React from 'react';
import { DownOutlined, LogoutOutlined } from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';

function Header({ onLogout }) {
  const menu = (
    <Menu>
      <Menu.Item key="logout" onClick={onLogout} icon={<LogoutOutlined />}>
        Déconnexion
      </Menu.Item>
    </Menu>
  );

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
          <img src="/image/profil.png" alt="profil utilisateur" />
        </div>
        <Dropdown overlay={menu} trigger={['click']} className='logout'>
          <div style={{ cursor: 'pointer' }}>
            <div className="nomEtRole">
              <h5>Mijoro</h5>
              <h6>Admin</h6>
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
