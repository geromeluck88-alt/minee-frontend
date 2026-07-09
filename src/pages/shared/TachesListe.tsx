// src/pages/shared/TachesListe.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ListTodo, Calendar, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/Layout';
import { Modal, Spinner, EmptyState, ProgressBar } from '@/components/ui';
import {
  STATUT_TACHE_LABEL, PRIORITE_LABEL, statutBadge, prioriteBadge,
  formatDate,
} from '@/lib/utils';
import type { Tache, StatutTache, Priorite, Projet, Utilisateur } from '@/types';

export default function TachesListe() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [filterStatut, setFilterStatut] = useState<StatutTache | ''>('');

  const { data, isLoading } = useQuery({
    queryKey: ['taches', filterStatut],
    queryFn: async () =>
      (await api.get('/taches', { params: { statut: filterStatut || undefined } })).data,
  });

  const updateStatut = useMutation({
    mutationFn: ({ id, statut, avancement }: { id: number; statut: StatutTache; avancement: number }) =>
      api.put(`/taches/${id}`, { statut, avancement }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['taches'] }); toast.success('Tâche mise à jour'); },
  });

  const supprimer = useMutation({
    mutationFn: (id: number) => api.delete(`/taches/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['taches'] }); toast.success('Supprimée'); },
  });

  const peutCreer = user?.role === 'ADMIN' || user?.role === 'CHEF_PROJET' || user?.role === 'CHEF_EQUIPE';

  return (
    <>
      <PageHeader
        title="Tâches"
        action={peutCreer && (
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Nouvelle tâche
          </button>
        )}
      />

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilterStatut('')} className={`px-3 py-1.5 rounded-lg text-sm ${!filterStatut ? 'bg-brand-cyan/10 text-brand-cyan' : 'text-text-muted hover:bg-bg-100'}`}>
          Toutes
        </button>
        {(['A_FAIRE', 'EN_COURS', 'TERMINE', 'EN_RETARD', 'BLOQUE'] as StatutTache[]).map((s) => (
          <button key={s} onClick={() => setFilterStatut(s)} className={`px-3 py-1.5 rounded-lg text-sm ${filterStatut === s ? 'bg-brand-cyan/10 text-brand-cyan' : 'text-text-muted hover:bg-bg-100'}`}>
            {STATUT_TACHE_LABEL[s]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-text-muted">Chargement…</div>
      ) : data?.taches?.length === 0 ? (
        <EmptyState icon={ListTodo} title="Aucune tâche" message="Aucune tâche ne correspond" />
      ) : (
        <div className="space-y-2">
          {data?.taches?.map((t: Tache) => (
            <div key={t.id} className="card-hover">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{t.titre}</div>
                  {t.description && <div className="text-text-muted text-sm mt-0.5 line-clamp-1">{t.description}</div>}
                  <div className="flex items-center gap-3 text-xs text-text-dim mt-2">
                    {t.projet && <span>📁 {t.projet.nom}</span>}
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(t.dateFinPrevue)}</span>
                    {t.assigneA && <span>👤 {t.assigneA.nom}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-1.5">
                    <span className={statutBadge(t.statut)}>{STATUT_TACHE_LABEL[t.statut]}</span>
                    <span className={prioriteBadge(t.priorite)}>{PRIORITE_LABEL[t.priorite]}</span>
                  </div>
                  {(user?.role === 'ADMIN' || user?.role === 'CHEF_PROJET') && (
                    <button
                      onClick={() => { if (confirm('Supprimer ?')) supprimer.mutate(t.id); }}
                      className="text-text-dim hover:text-brand-red p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1"><ProgressBar value={t.avancement} /></div>
                <span className="text-xs text-text-muted">{t.avancement}%</span>
              </div>
              {(t.assigneAId === user?.id || user?.role === 'ADMIN' || user?.role === 'CHEF_PROJET') && (
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 flex-wrap">
                  <select
                    value={t.statut}
                    onChange={(e) => updateStatut.mutate({ id: t.id, statut: e.target.value as StatutTache, avancement: t.avancement })}
                    className="text-xs bg-bg-100 border border-white/10 rounded px-2 py-1"
                  >
                    {Object.entries(STATUT_TACHE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <input
                    type="range" min="0" max="100" step="5" value={t.avancement}
                    onChange={(e) => updateStatut.mutate({ id: t.id, statut: t.statut, avancement: parseInt(e.target.value) })}
                    className="flex-1 max-w-xs"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <NewTacheModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

function NewTacheModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    titre: '', description: '', dateDebut: '', dateFinPrevue: '',
    statut: 'A_FAIRE' as StatutTache, priorite: 'NORMALE' as Priorite,
    projetId: '', assigneAId: '',
  });

  const { data: projets } = useQuery({
    queryKey: ['projets'],
    queryFn: async () => (await api.get('/projets')).data,
    enabled: open,
  });

  const { data: chefsEquipe } = useQuery({
    queryKey: ['chefs-equipe'],
    queryFn: async () => (await api.get('/utilisateurs', { params: { role: 'CHEF_EQUIPE' } })).data,
    enabled: open,
  });

  const create = useMutation({
    mutationFn: () => api.post('/taches', {
      ...form,
      assigneAId: form.assigneAId || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['taches'] });
      toast.success('Tâche créée');
      onClose();
      setForm({ titre: '', description: '', dateDebut: '', dateFinPrevue: '', statut: 'A_FAIRE', priorite: 'NORMALE', projetId: '', assigneAId: '' });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erreur'),
  });

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle tâche" size="lg">
      <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-4">
        <div><label className="label">Titre</label>
          <input required className="input" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} />
        </div>
        <div><label className="label">Description</label>
          <textarea rows={2} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Date début</label>
            <input required type="date" className="input" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} />
          </div>
          <div><label className="label">Date fin prévue</label>
            <input required type="date" className="input" value={form.dateFinPrevue} onChange={(e) => setForm({ ...form, dateFinPrevue: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Priorité</label>
            <select className="input" value={form.priorite} onChange={(e) => setForm({ ...form, priorite: e.target.value as Priorite })}>
              {Object.entries(PRIORITE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div><label className="label">Statut</label>
            <select className="input" value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value as StatutTache })}>
              {Object.entries(STATUT_TACHE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <div><label className="label">Projet</label>
          <select required className="input" value={form.projetId} onChange={(e) => setForm({ ...form, projetId: e.target.value })}>
            <option value="">— Sélectionner —</option>
            {projets?.projets?.map((p: Projet) => <option key={p.id} value={p.id}>{p.nom}</option>)}
          </select>
        </div>
        <div><label className="label">Assigner à (chef d'équipe)</label>
          <select className="input" value={form.assigneAId} onChange={(e) => setForm({ ...form, assigneAId: e.target.value })}>
            <option value="">— Personne —</option>
            {chefsEquipe?.utilisateurs?.map((u: Utilisateur) => <option key={u.id} value={u.id}>{u.nom}</option>)}
          </select>
        </div>
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
