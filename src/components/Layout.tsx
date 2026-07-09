// src/components/Layout.tsx
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABEL, roleHome } from '@/lib/utils';
import {
  LayoutDashboard, FolderKanban, ListTodo, FileText, Users,
  ShieldCheck, LogOut, ClipboardList,
} from 'lucide-react';
import type { Role } from '@/types';

interface NavItem { to: string; label: string; icon: any; }

const navByRole: Record<Role, NavItem[]> = {
  ADMIN: [
    { to: '/admin',               label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/admin/projets',       label: 'Projets',         icon: FolderKanban },
    { to: '/admin/utilisateurs',  label: 'Utilisateurs',    icon: Users },
    { to: '/admin/inspections',   label: 'Inspections',     icon: ShieldCheck },
    { to: '/admin/rapports',      label: 'Rapports',        icon: FileText },
  ],
  CHEF_PROJET: [
    { to: '/chef-projet',           label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/chef-projet/projets',   label: 'Mes projets',     icon: FolderKanban },
    { to: '/chef-projet/taches',    label: 'Tâches',          icon: ListTodo },
    { to: '/chef-projet/equipes',   label: 'Équipes',         icon: Users },
    { to: '/chef-projet/rapports',  label: 'Rapports',        icon: FileText },
  ],
  CHEF_EQUIPE: [
    { to: '/chef-equipe',           label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/chef-equipe/taches',    label: 'Mes tâches',      icon: ListTodo },
    { to: '/chef-equipe/equipes',   label: 'Mes équipes',     icon: Users },
    { to: '/chef-equipe/rapports',  label: 'Rapports',        icon: ClipboardList },
    { to: '/chef-equipe/projets',   label: 'Projets',         icon: FolderKanban },
  ],
  INSPECTEUR: [
    { to: '/inspecteur',              label: 'Tableau de bord',  icon: LayoutDashboard },
    { to: '/inspecteur/inspections',  label: 'Mes inspections',  icon: ShieldCheck },
    { to: '/inspecteur/projets',      label: 'Projets',          icon: FolderKanban },
  ],
};

export default function Layout({ role }: { role: Role }) {
  const { user, logout, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/connexion" replace state={{ from: location }} />;
  if (user.role !== role) return <Navigate to={roleHome(user.role)} replace />;

  const items = navByRole[role];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-50 border-r border-white/10 flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-purple flex items-center justify-center font-bold text-bg">
              M
            </div>
            <div>
              <div className="font-bold text-sm">MEE Cameroun</div>
              <div className="text-[10px] uppercase tracking-widest text-text-dim mt-0.5">
                Suivi de projets
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split('/').length === 2}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-brand-cyan/10 text-brand-cyan'
                    : 'text-text-muted hover:bg-bg-100 hover:text-text'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 mb-2">
            <div className="text-sm font-medium truncate">{user.nom}</div>
            <div className="text-xs text-text-dim">{ROLE_LABEL[user.role]}</div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-muted hover:bg-brand-red/10 hover:text-brand-red transition"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-cyan/30 border-t-brand-cyan rounded-full animate-spin" />
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-text-muted mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
