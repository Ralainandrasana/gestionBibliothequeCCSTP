import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PageLoader from './PageLoader';
import { ALL_ROLES, CATALOGUE_ROLES, ROLES, STAFF_ROLES } from '../config/accessControl';

const Personne = lazy(() => import('./Personne'));
const Dashboard = lazy(() => import('./Dashboard'));
const Adherent = lazy(() => import('./Adherent'));
const AjoutPersonne = lazy(() => import('../forms/ajoutPersonne'));
const AjoutAdherent = lazy(() => import('../forms/AjoutAdherent'));
const AjoutEmprunt = lazy(() => import('../forms/AjoutEmprunt'));
const AjoutLivre = lazy(() => import('../forms/AjoutLivre'));
const EmpruntRendu = lazy(() => import('./EmpruntRendu'));
const EmpruntNonRendu = lazy(() => import('./EmpruntNonRendu'));
const EtatDesLivres = lazy(() => import('./EtatDesLivres'));
const Catalogue = lazy(() => import('./Catalogue'));
const HistoriqueSysteme = lazy(() => import('./HistoriqueSysteme'));
const Dewey = lazy(() => import('./Dewey'));
const User = lazy(() => import('./User'));
const ClassementAdherant = lazy(() => import('./ClassementAdherant'));
const ClassementLivre = lazy(() => import('./ClassementLivre'));
const AjoutUtilisateur = lazy(() => import('../forms/AjoutUtilisateur'));
const Unauthorized = lazy(() => import('./Unauthorized'));
const EntityRecordPage = lazy(() => import('./EntityRecordPage'));
const Profile = lazy(() => import('./Profile'));
const ComingSoon = lazy(() => import('./ComingSoon'));

const withRoles = (element, roles) => (
  <ProtectedRoute roles={roles}>{element}</ProtectedRoute>
);

function Content() {
  return (
    <div style={{ width: "80%", padding: '20px', overflow: 'auto' }} className='content'>
      <Suspense fallback={<PageLoader contained message="Chargement de la page" />}>
        <Routes>
        {/* Dashboard */}
        <Route path="/dashboard" element={withRoles(<Dashboard />, ALL_ROLES)} />
        <Route path="/profil" element={withRoles(<Profile />, ALL_ROLES)} />
        
        {/* Adherent */}
        <Route path="/Adherent/Adherent" element={withRoles(<Adherent />, STAFF_ROLES)} />
        <Route path="/Adherent/Adherent/view/:id" element={withRoles(<EntityRecordPage entity="adherent" mode="view" />, STAFF_ROLES)} />
        <Route path="/Adherent/Adherent/edit/:id" element={withRoles(<EntityRecordPage entity="adherent" mode="edit" />, STAFF_ROLES)} />
        <Route path="/Adherent/Personne" element={withRoles(<Personne />, STAFF_ROLES)} />
        <Route path="/Adherent/Personne/view/:id" element={withRoles(<EntityRecordPage entity="personne" mode="view" />, STAFF_ROLES)} />
        <Route path="/Adherent/Personne/edit/:id" element={withRoles(<EntityRecordPage entity="personne" mode="edit" />, STAFF_ROLES)} />
        <Route path="/Adherent/Personne/ajoutPersonne" element={withRoles(<AjoutPersonne />, STAFF_ROLES)} />
        <Route path="/Adherent/Adherent/ajoutAdherent" element={withRoles(<AjoutAdherent />, STAFF_ROLES)} />
        
        {/* Gestion Bibliotheque */}
        <Route path="/GestionBibliotheque/EmpruntLivre/nonRendu" element={withRoles(<EmpruntNonRendu />, STAFF_ROLES)} />
        <Route path="/GestionBibliotheque/EmpruntLivre/nonRendu/view/:id" element={withRoles(<EntityRecordPage entity="emprunt" mode="view" />, STAFF_ROLES)} />
        <Route path="/GestionBibliotheque/EmpruntLivre/nonRendu/edit/:id" element={withRoles(<EntityRecordPage entity="emprunt" mode="edit" />, STAFF_ROLES)} />
        <Route path="/GestionBibliotheque/EmpruntLivre/Rendu" element={withRoles(<EmpruntRendu />, STAFF_ROLES)} />
        <Route
          path="/GestionBibliotheque/EmpruntPeriodique/nonRendu"
          element={withRoles(
            <ComingSoon
              title="Emprunts périodiques non rendus"
              breadcrumbs={['Gestion Bibliothèque', 'Emprunt périodique', 'Non rendu']}
            />,
            STAFF_ROLES
          )}
        />
        <Route
          path="/GestionBibliotheque/EmpruntPeriodique/Rendu"
          element={withRoles(
            <ComingSoon
              title="Emprunts périodiques rendus"
              breadcrumbs={['Gestion Bibliothèque', 'Emprunt périodique', 'Rendu']}
            />,
            STAFF_ROLES
          )}
        />
        <Route path="/GestionBibliotheque/EtatDesLivres" element={withRoles(<EtatDesLivres />, STAFF_ROLES)} />
        <Route path="/GestionBibliotheque/EtatDesLivres/view/:id" element={withRoles(<EntityRecordPage entity="livre" mode="view" />, STAFF_ROLES)} />
        <Route path="/GestionBibliotheque/EtatDesLivres/edit/:id" element={withRoles(<EntityRecordPage entity="livre" mode="edit" />, STAFF_ROLES)} />
        <Route path="/GestionBibliotheque/EtatDesLivres/ajoutLivre" element={withRoles(<AjoutLivre />, STAFF_ROLES)} />
        <Route path="/GestionBibliotheque/EmpruntLivre/nonRendu/ajoutEmprunt" element={withRoles(<AjoutEmprunt />, STAFF_ROLES)} />

        {/* Gestion Ludothèque */}
        <Route
          path="/Gestion Ludotheque"
          element={withRoles(
            <ComingSoon title="Gestion ludothèque" breadcrumbs={['Gestion ludothèque']} />,
            STAFF_ROLES
          )}
        />
        
        {/* Catalogue */}
        <Route path="/Catalogue" element={withRoles(<Catalogue />, CATALOGUE_ROLES)} />
        
        {/* Classement */}
        <Route path="/Classement/Adherant" element={withRoles(<ClassementAdherant />, [ROLES.ADMIN])} />
        <Route path="/Classement/Livre" element={withRoles(<ClassementLivre />, [ROLES.ADMIN])} />
        
        {/* Parametre */}
        <Route path="/Parametre/Dewey" element={withRoles(<Dewey />, STAFF_ROLES)} />
        <Route path="/Parametre/Administrateur/HistoriqueSysteme" element={withRoles(<HistoriqueSysteme />, [ROLES.ADMIN])} />
        <Route path="/Parametre/Administrateur/User" element={withRoles(<User />, STAFF_ROLES)} />
        <Route path="/Parametre/Administrateur/User/view/:id" element={withRoles(<EntityRecordPage entity="user" mode="view" />, STAFF_ROLES)} />
        <Route path="/Parametre/Administrateur/User/edit/:id" element={withRoles(<EntityRecordPage entity="user" mode="edit" />, [ROLES.ADMIN])} />
        <Route path="/Parametre/Administrateur/User/ajoutUtilisateur" element={withRoles(<AjoutUtilisateur />, [ROLES.ADMIN])} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Fallback - si aucune route ne correspond */}
        <Route path="*" element={<Navigate to="/unauthorized" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default Content;
