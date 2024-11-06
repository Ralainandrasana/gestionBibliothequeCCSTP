import { useNavigate } from 'react-router-dom';
import { DashboardOutlined, TeamOutlined, TableOutlined, PlayCircleOutlined, ProfileOutlined, StarOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import React from 'react';

function SideMenu(){
    const navigate = useNavigate()
    return (
        <Menu 
        style={{width: "20%", height: "100%", paddingTop: "15px"}}
        mode="inline"
        onClick={({key})=>{
          navigate(key)
        }}
          items={[
            { label: "Tableau de bord" ,
              icon: <DashboardOutlined />,
              key: "/"
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
            { label: "Gestion Bibliotheque",
              icon: <TableOutlined />,
              key: "/Gestion Bibliotheque",
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
                  label: 'Emprunt periodique' ,
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
            { label: "Gestion Ludotheque",
              icon: <PlayCircleOutlined />,
              key: "/Gestion Ludotheque"
            },
            { label: "Catalogue",
              icon: <ProfileOutlined />,
              key: "/Catalogue"
            },
            { label: "Classement",
              icon: <StarOutlined />,
              key: "/Classement"
            },
            { label: "Parametre",
              icon: <SettingOutlined />,
              key: "/Parametre"
            },
          ]}
        ></Menu>
    )
  }

export default SideMenu