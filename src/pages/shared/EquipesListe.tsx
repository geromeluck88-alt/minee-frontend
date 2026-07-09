// src/pages/shared/EquipesListe.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/Layout';
import { Modal, Spinner, EmptyState } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { Equipe, Projet, Utilisateur } from '@/types';

export default function EquipesListe() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [equipeSelectionnee, setEquipeSelectionnee] = useState<Equipe | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['equipes'],
    queryFn: async () => (await api.get('/equipes')).data,
  });

  const peutCreer = user?.role !== 'INSPECTEUR';

  return (
    <>
      <PageHeader
        title="Équipes"
        action={peutCreer && (
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Nouvelle équipe
          </button>
        )}
      />

      {isLoading ? (
        <div className="text-text-muted">Chargement…</div>
      ) : data?.equipes?.length === 0 ? (
        <EmptyState icon={Users} title="Aucune équipe" message="Créez votre première équipe" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.equipes?.map((e: Equipe) => (
            <div key={e.id} className="card-hover">
              <h3 className="font-semibold mb-1">{e.nom}</h3>
              <p className="text-text-muted text-sm mb-3 line-clamp-2">{e.description || '—'}</p>
              <div className="text-xs text-text-muted space-y-1 pt-3 border-t border-white/5">
                <div>👤 Chef : {e.chefEquipe?.nom}</div>
                {e.projet && <div>📁 Projet : {e.projet.nom}</div>}
                <div>👥 {e._count?.membres ?? e.membres?.length ?? 0} membres</div>
              </div>
              <button
                onClick={() => setEquipeSelectionnee(e)}
                className="mt-3 w-full btn-secondary justify-center text-sm"
              >
                <UserPlus className="w-3.5 h-3.5" /> Gérer les membres
              </button>
            </div>
          ))}
        </div>
      )}

      <NewEquipeModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <MembresModal equipe={equipeSelectionnee} onClose={() => setEquipeSelectionnee(null)} />
    </>
  );
}

function NewEquipeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ nom: '', description: '', chefEquipeId: '', projetId: '' });

  const { data: chefs } = useQuery({
    queryKey: ['chefs-equipe'],
    queryFn: async () => (await api.get('/utilisateurs', { params: { role: 'CHEF_EQUIPE' } })).data,
    enabled: open,
  });
  const { data: projets } = useQuery({
    queryKey: ['projets'],
    queryFn: async () => (await api.get('/projets')).data,
    enabled: open,
  });

  const create = useMutation({
    mutationFn: () => api.post('/equipes', { ...form, projetId: form.projetId || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equipes'] });
      toast.success('Équipe créée');
      onClose();
      setForm({ nom: '', description: '', chefEquipeId: '', projetId: '' });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erreur'),
  });

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle équipe">
      <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-4">
        <div><label className="label">Nom</label>
          <input required className="input" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
        </div>
        <div><label className="label">Description</label>
          <textarea rows={2} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div><label className="label">Chef d'équipe</label>
          <select required className="input" value={form.chefEquipeId} onChange={(e) => setForm({ ...form, chefEquipeId: e.target.value })}>
            <option value="">— Sélectionner —</option>
            {chefs?.utilisateurs?.map((u: Utilisateur) => <option key={u.id} value={u.id}>{u.nom}</option>)}
          </select>
        </div>
        <div><label className="label">Projet (optionnel)</label>
          <select className="input" value={form.projetId} onChange={(e) => setForm({ ...form, projetId: e.target.value })}>
            <option value="">— Aucun —</option>
            {projets?.projets?.map((p: Projet) => <option key={p.id} value={p.id}>{p.nom}</option>)}
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

function MembresModal({ equipe, onClose }: { equipe: Equipe | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [utilisateurId, setUtilisateurId] = useState('');

  const { data: equipeData } = useQuery({
    queryKey: ['equipe', equipe?.id],
    queryFn: async () => (await api.get(`/equipes/${equipe!.id}`)).data,
    enabled: !!equipe,
  });

  const { data: users } = useQuery({
    queryKey: ['utilisateurs', 'all'],
    queryFn: async () => (await api.get('/utilisateurs')).data,
    enabled: !!equipe,
  });

  const ajouter = useMutation({
    mutationFn: () => api.post(`/equipes/${equipe!.id}/membres`, { utilisateurId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equipe', equipe?.id] });
      qc.invalidateQueries({ queryKey: ['equipes'] });
      setUtilisateurId('');
      toast.success('Membre ajouté');
    },
  });

  const retirer = useMutation({
    mutationFn: (uid: number) => api.delete(`/equipes/${equipe!.id}/membres/${uid}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equipe', equipe?.id] });
      qc.invalidateQueries({ queryKey: ['equipes'] });
      toast.success('Membre retiré');
    },
  });

  if (!equipe) return null;

  return (
    <Modal open={!!equipe} onClose={onClose} title={`Membres — ${equipe.nom}`}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <select className="input flex-1" value={utilisateurId} onChange={(e) => setUtilisateurId(e.target.value)}>
            <option value="">— Choisir un utilisateur —</option>
            {users?.utilisateurs?.map((u: Utilisateur) => (
              <option key={u.id} value={u.id}>{u.nom} ({u.email})</option>
            ))}
          </select>
          <button onClick={() => ajouter.mutate()} disabled={!utilisateurId || ajouter.isPending} className="btn-primary">
            Ajouter
          </button>
        </div>
        <div className="space-y-1">
          {equipeData?.equipe?.membres?.length === 0 ? (
            <p className="text-text-muted text-sm py-3 text-center">Aucun membre</p>
          ) : (
            equipeData?.equipe?.membres?.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-bg-100 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{m.utilisateur?.nom}</div>
                  <div className="text-xs text-text-muted">{m.utilisateur?.email}</div>
                </div>
                <button
                  onClick={() => retirer.mutate(m.utilisateur.id)}
                  className="text-text-muted hover:text-brand-red text-sm"
                >
                  Retirer
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
