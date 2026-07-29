import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardOutlined, TeamOutlined, TableOutlined, PlayCircleOutlined, ProfileOutlined, StarOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ALL_ROLES, CATALOGUE_ROLES, hasAnyRole, ROLES, STAFF_ROLES } from '../config/accessControl';

function SideMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [selectedKey, setSelectedKey] = useState('/dashboard');
  const [openKeys, setOpenKeys] = useState([]);

  // ✅ Toutes les clés parentes possibles
  const parentKeys = {
    '/Adherent/Adherent': ['/Adherent'],
    '/Adherent/Personne': ['/Adherent'],
    '/GestionBibliotheque/EmpruntLivre/nonRendu': ['/Gestion Bibliotheque', '/Gestion Bibliotheque/Emprunt livre'],
    '/GestionBibliotheque/EmpruntLivre/Rendu': ['/Gestion Bibliotheque', '/Gestion Bibliotheque/Emprunt livre'],
    '/GestionBibliotheque/EmpruntPeriodique/nonRendu': ['/Gestion Bibliotheque', '/Gestion Bibliotheque/Emprunt periodique'],
    '/GestionBibliotheque/EmpruntPeriodique/Rendu': ['/Gestion Bibliotheque', '/Gestion Bibliotheque/Emprunt periodique'],
    '/GestionBibliotheque/EtatDesLivres': ['/Gestion Bibliotheque'],
    '/Classement/Adherant': ['/Classement'],
    '/Classement/Livre': ['/Classement'],
    '/Parametre/Dewey': ['/Paramètre'],
    '/Parametre/Administrateur/HistoriqueSysteme': ['/Paramètre', '/Parametre/Administrateur'],
    '/Parametre/Administrateur/User': ['/Paramètre', '/Parametre/Administrateur'],
  };

  // ✅ Mettre à jour quand l'URL change
  useEffect(() => {
    const path = location.pathname;
    setSelectedKey(path);
    
    // Ouvrir les parents correspondants
    const parents = parentKeys[path] || [];
    setOpenKeys(parents);
  }, [location.pathname]);

  // ✅ Garder les sous-menus ouverts
  const onOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  // ✅ Navigation
  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
    // Garder les sous-menus ouverts
    const parents = parentKeys[key] || [];
    setOpenKeys(prevKeys => [...new Set([...prevKeys, ...parents])]);
    navigate(key);
  };

  const menuItems = [
    { 
      label: "Tableau de bord",
      icon: <DashboardOutlined />,
      key: "/dashboard"
    },
    {
      label: 'Adherent',
      icon: <TeamOutlined />,
      key: '/Adherent',
      children: [
        { key: '/Adherent/Adherent', label: 'Adherent' },
        { key: '/Adherent/Personne', label: 'Personne' },
      ],
    },
    { 
      label: "Gestion Bibliotheque",
      icon: <TableOutlined />,
      key: '/Gestion Bibliotheque',
      children: [
        { 
          key: '/Gestion Bibliotheque/Emprunt livre', 
          label: 'Emprunt livre',
          children: [
            { key: '/GestionBibliotheque/EmpruntLivre/nonRendu', label: 'Non Rendu' },
            { key: '/GestionBibliotheque/EmpruntLivre/Rendu', label: 'Rendu' },
          ],
        },
        { 
          key: '/Gestion Bibliotheque/Emprunt periodique', 
          label: 'Emprunt periodique',
          children: [
            { key: '/GestionBibliotheque/EmpruntPeriodique/nonRendu', label: 'Non Rendu' },
            { key: '/GestionBibliotheque/EmpruntPeriodique/Rendu', label: 'Rendu' },
          ],
        },
        { 
          key: '/GestionBibliotheque/EtatDesLivres', 
          label: 'Etat des livres' 
        },
      ]
    },
    { 
      label: "Gestion Ludotheque",
      icon: <PlayCircleOutlined />,
      key: "/Gestion Ludotheque"
    },
    { 
      label: "Catalogue",
      icon: <ProfileOutlined />,
      key: "/Catalogue"
    },
    { 
      label: "Classement",
      icon: <StarOutlined />,
      key: "/Classement",
      children: [
        { key: '/Classement/Adherant', label: 'Adherent' },
        { key: '/Classement/Livre', label: 'Livre' },
      ]
    },
    { 
      label: "Parametre",
      icon: <SettingOutlined />,
      key: "/Paramètre",
      children: [
        { key: '/Parametre/Dewey', label: 'Dewey' },
        { 
          key: '/Parametre/Administrateur', 
          label: 'Administrateur',
          children: [
            { key: '/Parametre/Administrateur/HistoriqueSysteme', label: 'Historique système' },
            { key: '/Parametre/Administrateur/User', label: 'Gestion utilisateur' },
          ]
        }
      ]
    },
  ];

  const menuRoles = {
    '/dashboard': ALL_ROLES,
    '/Adherent': STAFF_ROLES,
    '/Gestion Bibliotheque': STAFF_ROLES,
    '/Gestion Ludotheque': STAFF_ROLES,
    '/Catalogue': CATALOGUE_ROLES,
    '/Classement': [ROLES.ADMIN],
    '/Paramètre': STAFF_ROLES,
    '/Parametre/Administrateur/HistoriqueSysteme': [ROLES.ADMIN],
  };

  const filterMenuItems = (items, inheritedRoles = ALL_ROLES) =>
    items.reduce((visibleItems, item) => {
      const allowedRoles = menuRoles[item.key] || inheritedRoles;
      if (!hasAnyRole(user, allowedRoles)) {
        return visibleItems;
      }

      const menuItem = { ...item };
      if (item.children) {
        menuItem.children = filterMenuItems(item.children, allowedRoles);
        if (menuItem.children.length === 0) {
          return visibleItems;
        }
      }

      visibleItems.push(menuItem);
      return visibleItems;
    }, []);

  const visibleMenuItems = filterMenuItems(menuItems);

  return (
    <Menu 
      style={{ width: "20%", height: "100%", paddingTop: "15px" }}
      mode="inline"
      selectedKeys={[selectedKey]}
      openKeys={openKeys}
      onOpenChange={onOpenChange}
      onClick={handleMenuClick}
      items={visibleMenuItems}
    />
  );
}

export default SideMenu;
