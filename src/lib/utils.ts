// src/lib/utils.ts
import type { StatutProjet, StatutTache, StatutInspection, Priorite, Role } from '@/types';

export const STATUT_PROJET_LABEL: Record<StatutProjet, string> = {
  EN_ATTENTE: 'En attente',
  EN_COURS:   'En cours',
  TERMINE:    'Terminé',
  EN_RETARD:  'En retard',
  SUSPENDU:   'Suspendu',
};

export const STATUT_TACHE_LABEL: Record<StatutTache, string> = {
  A_FAIRE:   'À faire',
  EN_COURS:  'En cours',
  TERMINE:   'Terminé',
  BLOQUE:    'Bloqué',
  EN_RETARD: 'En retard',
};

export const STATUT_INSPECTION_LABEL: Record<StatutInspection, string> = {
  EN_ATTENTE: 'En attente',
  EN_COURS:   'En cours',
  TERMINE:    'Terminé',
};

export const PRIORITE_LABEL: Record<Priorite, string> = {
  BASSE:    'Basse',
  NORMALE:  'Normale',
  HAUTE:    'Haute',
  URGENTE:  'Urgente',
};

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN:        'Administrateur',
  CHEF_PROJET:  'Chef de projet',
  CHEF_EQUIPE:  'Chef d\'équipe',
  INSPECTEUR:   'Inspecteur',
};

export function statutBadge(s: StatutProjet | StatutTache | StatutInspection): string {
  if (s === 'TERMINE')           return 'badge-green';
  if (s === 'EN_COURS')          return 'badge-cyan';
  if (s === 'EN_RETARD' || s === 'BLOQUE') return 'badge-red';
  if (s === 'SUSPENDU')          return 'badge-purple';
  return 'badge-amber'; // EN_ATTENTE, A_FAIRE
}

export function prioriteBadge(p: Priorite): string {
  if (p === 'URGENTE') return 'badge-red';
  if (p === 'HAUTE')   return 'badge-amber';
  if (p === 'NORMALE') return 'badge-cyan';
  return 'badge-purple';
}

export function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export function formatMoney(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'XAF', maximumFractionDigits: 0,
  }).format(Number(n));
}

export function roleHome(role: Role): string {
  switch (role) {
    case 'ADMIN':        return '/admin';
    case 'CHEF_PROJET':  return '/chef-projet';
    case 'CHEF_EQUIPE':  return '/chef-equipe';
    case 'INSPECTEUR':   return '/inspecteur';
  }
}
