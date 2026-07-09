// src/pages/shared/ProjetsListe.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FolderKanban, Calendar, Users as UsersIcon, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/Layout';
import { EmptyState, Modal, Spinner } from '@/components/ui';
import {
  STATUT_PROJET_LABEL, PRIORITE_LABEL, statutBadge, prioriteBadge,
  formatDate, formatMoney,
} from '@/lib/utils';
import type { Projet, StatutProjet, Priorite, Utilisateur } from '@/types';

export default function ProjetsListe({ basePath }: { basePath: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['projets'],
    queryFn: async () => (await api.get('/projets')).data,
  });

  const supprimer = useMutation({
    mutationFn: (id: number) => api.delete(`/projets/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projets'] }); toast.success('Projet supprimé'); },
  });

  const peutCreer = user?.role === 'ADMIN' || user?.role === 'CHEF_PROJET';

  return (
    <>
      <PageHeader
        title="Projets"
        subtitle={user?.role === 'CHEF_PROJET' ? 'Mes projets' : 'Liste des projets'}
        action={peutCreer && (
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Nouveau projet
          </button>
        )}
      />

      {isLoading ? (
        <div className="text-text-muted">Chargement…</div>
      ) : data?.projets?.length === 0 ? (
        <EmptyState
          icon={FolderKanban} title="Aucun projet" message="Créez votre premier projet pour démarrer"
          action={peutCreer && (
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Créer un projet
            </button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.projets?.map((p: Projet) => (
            <Link to={`${basePath}/${p.id}`} key={p.id} className="card-hover flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold leading-tight flex-1">{p.nom}</h3>
                {user?.role === 'ADMIN' && (
                  <button
                    onClick={(e) => { e.preventDefault(); if (confirm('Supprimer ?')) supprimer.mutate(p.id); }}
                    className="text-text-dim hover:text-brand-red p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-text-muted text-sm line-clamp-2">{p.description || '—'}</p>
              <div className="flex flex-wrap gap-1.5">
                <span className={statutBadge(p.statut)}>{STATUT_PROJET_LABEL[p.statut]}</span>
                <span className={prioriteBadge(p.priorite)}>{PRIORITE_LABEL[p.priorite]}</span>
              </div>
              <div className="text-xs text-text-muted space-y-1 pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> {formatDate(p.dateDebut)} → {formatDate(p.dateFin)}
                </div>
                <div className="flex items-center gap-1.5">
                  <UsersIcon className="w-3.5 h-3.5" /> {p.chefProjet?.nom}
                </div>
                <div>Budget : <span className="text-text">{formatMoney(p.budget)}</span></div>
                {p._count && (
                  <div className="flex gap-3 pt-1 text-text-dim">
                    <span>{p._count.taches} tâches</span>
                    <span>{p._count.equipes} équipes</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <NewProjetModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

function NewProjetModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    nom: '', description: '', dateDebut: '', dateFin: '',
    statut: 'EN_ATTENTE' as StatutProjet,
    priorite: 'NORMALE' as Priorite,
    budget: '', chefProjetId: '',
  });

  const { data: chefs } = useQuery({
    queryKey: ['chefs-projet'],
    queryFn: async () => (await api.get('/utilisateurs', { params: { role: 'CHEF_PROJET' } })).data,
    enabled: open && user?.role === 'ADMIN',
  });

  const create = useMutation({
    mutationFn: () => api.post('/projets', {
      ...form,
      budget: form.budget || undefined,
      chefProjetId: form.chefProjetId || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projets'] });
      toast.success('Projet créé');
      onClose();
      setForm({ nom: '', description: '', dateDebut: '', dateFin: '', statut: 'EN_ATTENTE', priorite: 'NORMALE', budget: '', chefProjetId: '' });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erreur'),
  });

  return (
    <Modal open={open} onClose={onClose} title="Nouveau projet" size="lg">
      <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-4">
        <div><label className="label">Nom du projet</label>
          <input required className="input" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
        </div>
        <div><label className="label">Description</label>
          <textarea rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Date début</label>
            <input required type="date" className="input" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} />
          </div>
          <div><label className="label">Date fin prévue</label>
            <input required type="date" className="input" value={form.dateFin} onChange={(e) => setForm({ ...form, dateFin: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Statut</label>
            <select className="input" value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value as StatutProjet })}>
              {Object.entries(STATUT_PROJET_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div><label className="label">Priorité</label>
            <select className="input" value={form.priorite} onChange={(e) => setForm({ ...form, priorite: e.target.value as Priorite })}>
              {Object.entries(PRIORITE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <div><label className="label">Budget (FCFA)</label>
          <input type="number" className="input" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
        </div>
        {user?.role === 'ADMIN' && (
          <div><label className="label">Chef de projet</label>
            <select className="input" value={form.chefProjetId} onChange={(e) => setForm({ ...form, chefProjetId: e.target.value })}>
              <option value="">— Sélectionner —</option>
              {chefs?.utilisateurs?.map((u: Utilisateur) => <option key={u.id} value={u.id}>{u.nom}</option>)}
            </select>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
          <button type="submit" disabled={create.isPending} className="btn-primary">
            {create.isPending ? <Spinner /> : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
