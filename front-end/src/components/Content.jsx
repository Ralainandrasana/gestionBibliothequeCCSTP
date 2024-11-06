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

function Content(){
    return <div style={{width: "80%"}} className='content'>
      <Routes>
        <Route path='/' element={<Dashboard/>}></Route>
        <Route path='/Adherent/Adherent' element={<Adherent/>}></Route>
        <Route path='/Adherent/Personne' element={<Personne/>}></Route>
        <Route path='/GestionBibliotheque/EmpruntLivre/nonRendu' element={<EmpruntNonRendu/>}></Route>
        <Route path='/GestionBibliotheque/EmpruntLivre/Rendu' element={<EmpruntRendu/>}></Route>
        <Route path='/GestionBibliotheque/EtatDesLivres' element={<EtatDesLivres/>}></Route>
        <Route path='/Gestion Ludotheque' element={<div>Gestion Ludotheque</div>}></Route>
        <Route path='/Catalogue' element={<Catalogue/>}></Route>
        <Route path='/Classement' element={<div>Classement</div>}></Route>
        <Route path='/Parametre' element={<div>Parametre</div>}></Route>
        <Route path='/Adherent/Personne/ajoutPersonne' element={<AjoutPersonne/>}></Route>
        <Route path='/Adherent/Adherent/ajoutAdherent' element={<AjoutAdherent/>}></Route>
        <Route path='/GestionBibliotheque/EtatDesLivres/ajoutLivre' element={<AjoutLivre/>}></Route>
        <Route path='/GestionBibliotheque/EmpruntLivre/nonRendu/ajoutEmprunt' element={<AjoutEmprunt/>}></Route>
      </Routes>
    </div>
  }

export default Content