// src/types/index.ts
export type Role = 'ADMIN' | 'CHEF_PROJET' | 'CHEF_EQUIPE' | 'INSPECTEUR';

export type StatutProjet = 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'EN_RETARD' | 'SUSPENDU';
export type StatutTache = 'A_FAIRE' | 'EN_COURS' | 'TERMINE' | 'BLOQUE' | 'EN_RETARD';
export type StatutInspection = 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE';
export type Priorite = 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';

export interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  role: Role;
  telephone?: string | null;
  photo?: string | null;
  actif?: boolean;
  dateCreation?: string;
}

export interface Projet {
  id: number;
  nom: string;
  description?: string | null;
  dateDebut: string;
  dateFin: string;
  statut: StatutProjet;
  priorite: Priorite;
  budget?: number | null;
  chefProjetId: number;
  chefProjet?: Pick<Utilisateur, 'id' | 'nom' | 'email'>;
  taches?: Tache[];
  equipes?: Equipe[];
  inspections?: Inspection[];
  _count?: { taches: number; equipes: number; inspections: number };
}

export interface Tache {
  id: number;
  titre: string;
  description?: string | null;
  dateDebut: string;
  dateFinPrevue: string;
  statut: StatutTache;
  priorite: Priorite;
  avancement: number;
  projetId: number;
  assigneAId?: number | null;
  projet?: Pick<Projet, 'id' | 'nom'>;
  assigneA?: Pick<Utilisateur, 'id' | 'nom'> | null;
  rapports?: Rapport[];
}

export interface Equipe {
  id: number;
  nom: string;
  description?: string | null;
  chefEquipeId: number;
  projetId?: number | null;
  chefEquipe?: Pick<Utilisateur, 'id' | 'nom' | 'email'>;
  projet?: Pick<Projet, 'id' | 'nom'> | null;
  membres?: MembreEquipe[];
  _count?: { membres: number };
}

export interface MembreEquipe {
  id: number;
  equipeId: number;
  utilisateurId: number;
  utilisateur?: Utilisateur;
}

export interface Rapport {
  id: number;
  tacheId: number;
  chefEquipeId: number;
  titre: string;
  description: string;
  statutTache: StatutTache;
  avancement: number;
  observations?: string | null;
  photos?: string | null;
  dateCreation: string;
  tache?: Tache;
  chefEquipe?: Pick<Utilisateur, 'id' | 'nom'>;
}

export interface Inspection {
  id: number;
  projetId: number;
  inspecteurId: number;
  dateInspection: string;
  observations?: string | null;
  recommandations?: string | null;
  statut: StatutInspection;
  conforme?: boolean | null;
  projet?: Pick<Projet, 'id' | 'nom'>;
  inspecteur?: Pick<Utilisateur, 'id' | 'nom'>;
}
