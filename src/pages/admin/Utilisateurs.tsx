// src/pages/admin/Utilisateurs.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageHeader } from '@/components/Layout';
import { Modal, Spinner, EmptyState } from '@/components/ui';
import { ROLE_LABEL, formatDate } from '@/lib/utils';
import type { Utilisateur, Role } from '@/types';
import { Users } from 'lucide-react';

export default function AdminUtilisateurs() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<Role | ''>('');

  const { data, isLoading } = useQuery({
    queryKey: ['utilisateurs', filter],
    queryFn: async () => (await api.get('/utilisateurs', { params: { role: filter || undefined } })).data,
  });

  const toggleActif = useMutation({
    mutationFn: ({ id, actif }: { id: number; actif: boolean }) =>
      api.put(`/utilisateurs/${id}`, { actif }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['utilisateurs'] }); toast.success('Mis à jour'); },
  });

  const supprimer = useMutation({
    mutationFn: (id: number) => api.delete(`/utilisateurs/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['utilisateurs'] }); toast.success('Supprimé'); },
  });

  return (
    <>
      <PageHeader
        title="Utilisateurs"
        subtitle="Gérer les comptes de la plateforme"
        action={
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Nouveau
          </button>
        }
      />

      <div className="flex gap-2 mb-4">
        <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-sm ${!filter ? 'bg-brand-cyan/10 text-brand-cyan' : 'text-text-muted hover:bg-bg-100'}`}>
          Tous
        </button>
        {(['ADMIN', 'CHEF_PROJET', 'CHEF_EQUIPE', 'INSPECTEUR'] as Role[]).map((r) => (
          <button key={r} onClick={() => setFilter(r)} className={`px-3 py-1.5 rounded-lg text-sm ${filter === r ? 'bg-brand-cyan/10 text-brand-cyan' : 'text-text-muted hover:bg-bg-100'}`}>
            {ROLE_LABEL[r]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-text-muted">Chargement…</div>
      ) : data?.utilisateurs?.length === 0 ? (
        <EmptyState icon={Users} title="Aucun utilisateur" message="Ajoutez votre premier utilisateur" />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-bg-100 text-text-muted text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Nom</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Rôle</th>
                <th className="text-left px-4 py-3">Téléphone</th>
                <th className="text-left px-4 py-3">Créé le</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.utilisateurs?.map((u: Utilisateur) => (
                <tr key={u.id} className="border-t border-white/5 hover:bg-bg-100/50">
                  <td className="px-4 py-3 font-medium">{u.nom}</td>
                  <td className="px-4 py-3 text-text-muted">{u.email}</td>
                  <td className="px-4 py-3"><span className="badge-purple">{ROLE_LABEL[u.role]}</span></td>
                  <td className="px-4 py-3 text-text-muted">{u.telephone || '—'}</td>
                  <td className="px-4 py-3 text-text-muted">{u.dateCreation && formatDate(u.dateCreation)}</td>
                  <td className="px-4 py-3">
                    <span className={u.actif ? 'badge-green' : 'badge-red'}>
                      {u.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleActif.mutate({ id: u.id, actif: !u.actif })}
                      className="text-text-muted hover:text-brand-amber p-1.5"
                      title={u.actif ? 'Désactiver' : 'Activer'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { if (confirm('Supprimer ?')) supprimer.mutate(u.id); }}
                      className="text-text-muted hover:text-brand-red p-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NewUserModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

function NewUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    nom: '', email: '', motDePasse: '', telephone: '', role: 'CHEF_PROJET' as Role,
  });

  const create = useMutation({
    mutationFn: () => api.post('/utilisateurs', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['utilisateurs'] });
      toast.success('Utilisateur créé');
      onClose();
      setForm({ nom: '', email: '', motDePasse: '', telephone: '', role: 'CHEF_PROJET' });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erreur'),
  });

  return (
    <Modal open={open} onClose={onClose} title="Nouvel utilisateur">
      <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-4">
        <div><label className="label">Nom</label>
          <input required className="input" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
        </div>
        <div><label className="label">Email</label>
          <input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div><label className="label">Mot de passe</label>
          <input required type="password" minLength={6} className="input" value={form.motDePasse} onChange={(e) => setForm({ ...form, motDePasse: e.target.value })} />
        </div>
        <div><label className="label">Téléphone</label>
          <input className="input" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
        </div>
        <div><label className="label">Rôle</label>
          <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
            {(['ADMIN', 'CHEF_PROJET', 'CHEF_EQUIPE', 'INSPECTEUR'] as Role[]).map((r) =>
              <option key={r} value={r}>{ROLE_LABEL[r]}</option>
            )}
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
