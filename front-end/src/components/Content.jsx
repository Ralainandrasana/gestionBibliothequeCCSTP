import { Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import Personne from './Personne';
import Dashboard from './Dashboard';
import Adherent from './Adherent';
import AjoutPersonne from '../forms/ajoutPersonne';
import AjoutAdherent from '../forms/AjoutAdherent';
import AjoutEmprunt from '../forms/AjoutEmprunt';
import AjoutLivre from '../forms/AjoutLivre';
import EmpruntRendu from './EmpruntRendu';
import EmpruntNonRendu from './EmpruntNonRendu';
import EtatDesLivres from './EtatDesLivres';
import Catalogue from './Catalogue';
import HistoriqueSysteme from './HistoriqueSysteme';
import Dewey from './Dewey';
import User from './User';
import ClassementAdherant from './ClassementAdherant';
import ClassementLivre from './ClassementLivre';
import ProtectedRoute from './ProtectedRoute';
import Unauthorized from './Unauthorized';
import { ALL_ROLES, CATALOGUE_ROLES, ROLES, STAFF_ROLES } from '../config/accessControl';

const withRoles = (element, roles) => (
  <ProtectedRoute roles={roles}>{element}</ProtectedRoute>
);

function Content() {
  return (
    <div style={{ width: "80%", padding: '20px', overflow: 'auto' }} className='content'>
      <Routes>
        {/* Dashboard */}
        <Route path="/dashboard" element={withRoles(<Dashboard />, ALL_ROLES)} />
        
        {/* Adherent */}
        <Route path="/Adherent/Adherent" element={withRoles(<Adherent />, STAFF_ROLES)} />
        <Route path="/Adherent/Personne" element={withRoles(<Personne />, STAFF_ROLES)} />
        <Route path="/Adherent/Personne/ajoutPersonne" element={withRoles(<AjoutPersonne />, STAFF_ROLES)} />
        <Route path="/Adherent/Adherent/ajoutAdherent" element={withRoles(<AjoutAdherent />, STAFF_ROLES)} />
        
        {/* Gestion Bibliotheque */}
        <Route path="/GestionBibliotheque/EmpruntLivre/nonRendu" element={withRoles(<EmpruntNonRendu />, STAFF_ROLES)} />
        <Route path="/GestionBibliotheque/EmpruntLivre/Rendu" element={withRoles(<EmpruntRendu />, STAFF_ROLES)} />
        <Route path="/GestionBibliotheque/EtatDesLivres" element={withRoles(<EtatDesLivres />, STAFF_ROLES)} />
        <Route path="/GestionBibliotheque/EtatDesLivres/ajoutLivre" element={withRoles(<AjoutLivre />, STAFF_ROLES)} />
        <Route path="/GestionBibliotheque/EmpruntLivre/nonRendu/ajoutEmprunt" element={withRoles(<AjoutEmprunt />, STAFF_ROLES)} />
        
        {/* Catalogue */}
        <Route path="/Catalogue" element={withRoles(<Catalogue />, CATALOGUE_ROLES)} />
        
        {/* Classement */}
        <Route path="/Classement/Adherant" element={withRoles(<ClassementAdherant />, [ROLES.ADMIN])} />
        <Route path="/Classement/Livre" element={withRoles(<ClassementLivre />, [ROLES.ADMIN])} />
        
        {/* Parametre */}
        <Route path="/Parametre/Dewey" element={withRoles(<Dewey />, STAFF_ROLES)} />
        <Route path="/Parametre/Administrateur/HistoriqueSysteme" element={withRoles(<HistoriqueSysteme />, [ROLES.ADMIN])} />
        <Route path="/Parametre/Administrateur/User" element={withRoles(<User />, STAFF_ROLES)} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Fallback - si aucune route ne correspond */}
        <Route path="*" element={<Navigate to="/unauthorized" replace />} />
      </Routes>
    </div>
  );
}

export default Content;
