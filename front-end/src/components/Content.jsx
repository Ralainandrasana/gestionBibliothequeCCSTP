import { Routes, Route } from 'react-router-dom';
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

function Content() {
  return (
    <div style={{ width: "80%", padding: '20px', overflow: 'auto' }} className='content'>
      <Routes>
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Adherent */}
        <Route path="/Adherent/Adherent" element={<Adherent />} />
        <Route path="/Adherent/Personne" element={<Personne />} />
        <Route path="/Adherent/Personne/ajoutPersonne" element={<AjoutPersonne />} />
        <Route path="/Adherent/Adherent/ajoutAdherent" element={<AjoutAdherent />} />
        
        {/* Gestion Bibliotheque */}
        <Route path="/GestionBibliotheque/EmpruntLivre/nonRendu" element={<EmpruntNonRendu />} />
        <Route path="/GestionBibliotheque/EmpruntLivre/Rendu" element={<EmpruntRendu />} />
        <Route path="/GestionBibliotheque/EtatDesLivres" element={<EtatDesLivres />} />
        <Route path="/GestionBibliotheque/EtatDesLivres/ajoutLivre" element={<AjoutLivre />} />
        <Route path="/GestionBibliotheque/EmpruntLivre/nonRendu/ajoutEmprunt" element={<AjoutEmprunt />} />
        
        {/* Catalogue */}
        <Route path="/Catalogue" element={<Catalogue />} />
        
        {/* Classement */}
        <Route path="/Classement/Adherant" element={<ClassementAdherant />} />
        <Route path="/Classement/Livre" element={<ClassementLivre />} />
        
        {/* Parametre */}
        <Route path="/Parametre/Dewey" element={<Dewey />} />
        <Route path="/Parametre/Administrateur/HistoriqueSysteme" element={<HistoriqueSysteme />} />
        <Route path="/Parametre/Administrateur/User" element={<User />} />
        
        {/* Fallback - si aucune route ne correspond */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default Content;