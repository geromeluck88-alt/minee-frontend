// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Layout, { FullScreenLoader } from '@/components/Layout';
import { roleHome } from '@/lib/utils';

// Auth
import Connexion from '@/pages/auth/Connexion';
import Inscription from '@/pages/auth/Inscription';

// Dashboards par rôle
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminUtilisateurs from '@/pages/admin/Utilisateurs';
import ChefProjetDashboard from '@/pages/chefProjet/Dashboard';
import ChefEquipeDashboard from '@/pages/chefEquipe/Dashboard';
import InspecteurDashboard from '@/pages/inspecteur/Dashboard';

// Pages partagées
import ProjetsListe from '@/pages/shared/ProjetsListe';
import ProjetDetail from '@/pages/shared/ProjetDetail';
import TachesListe from '@/pages/shared/TachesListe';
import RapportsListe from '@/pages/shared/RapportsListe';
import EquipesListe from '@/pages/shared/EquipesListe';
import InspectionsListe from '@/pages/shared/InspectionsListe';

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;

  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/connexion" element={<Connexion />} />
      <Route path="/inscription" element={<Inscription />} />

      {/* ═══ ADMIN ═══════════════════════════════════════════════════════ */}
      <Route path="/admin" element={<Layout role="ADMIN" />}>
        <Route index                element={<AdminDashboard />} />
        <Route path="utilisateurs"  element={<AdminUtilisateurs />} />
        <Route path="projets"       element={<ProjetsListe basePath="/admin/projets" />} />
        <Route path="projets/:id"   element={<ProjetDetail basePath="/admin/projets" />} />
        <Route path="rapports"      element={<RapportsListe />} />
        <Route path="inspections"   element={<InspectionsListe />} />
      </Route>

      {/* ═══ CHEF DE PROJET ═══════════════════════════════════════════════ */}
      <Route path="/chef-projet" element={<Layout role="CHEF_PROJET" />}>
        <Route index                element={<ChefProjetDashboard />} />
        <Route path="projets"       element={<ProjetsListe basePath="/chef-projet/projets" />} />
        <Route path="projets/:id"   element={<ProjetDetail basePath="/chef-projet/projets" />} />
        <Route path="taches"        element={<TachesListe />} />
        <Route path="equipes"       element={<EquipesListe />} />
        <Route path="rapports"      element={<RapportsListe />} />
      </Route>

      {/* ═══ CHEF D'ÉQUIPE ════════════════════════════════════════════════ */}
      <Route path="/chef-equipe" element={<Layout role="CHEF_EQUIPE" />}>
        <Route index                element={<ChefEquipeDashboard />} />
        <Route path="taches"        element={<TachesListe />} />
        <Route path="equipes"       element={<EquipesListe />} />
        <Route path="rapports"      element={<RapportsListe />} />
        <Route path="projets"       element={<ProjetsListe basePath="/chef-equipe/projets" />} />
        <Route path="projets/:id"   element={<ProjetDetail basePath="/chef-equipe/projets" />} />
      </Route>

      {/* ═══ INSPECTEUR ═══════════════════════════════════════════════════ */}
      <Route path="/inspecteur" element={<Layout role="INSPECTEUR" />}>
        <Route index                element={<InspecteurDashboard />} />
        <Route path="inspections"   element={<InspectionsListe />} />
        <Route path="projets"       element={<ProjetsListe basePath="/inspecteur/projets" />} />
        <Route path="projets/:id"   element={<ProjetDetail basePath="/inspecteur/projets" />} />
      </Route>

      {/* Redirections */}
      <Route path="/" element={
        user ? <Navigate to={roleHome(user.role)} replace /> : <Navigate to="/connexion" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
