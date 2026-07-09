// src/pages/shared/RapportsListe.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileText, Image as ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/Layout';
import { Modal, Spinner, EmptyState, ProgressBar } from '@/components/ui';
import { STATUT_TACHE_LABEL, statutBadge, formatDate } from '@/lib/utils';
import type { Rapport, Tache, StatutTache } from '@/types';

export default function RapportsListe() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['rapports'],
    queryFn: async () => (await api.get('/rapports')).data,
  });

  const peutCreer = user?.role === 'CHEF_EQUIPE' || user?.role === 'CHEF_PROJET';

  return (
    <>
      <PageHeader
        title="Rapports"
        subtitle="Comptes-rendus d'avancement des tâches"
        action={peutCreer && (
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Nouveau rapport
          </button>
        )}
      />

      {isLoading ? (
        <div className="text-text-muted">Chargement…</div>
      ) : data?.rapports?.length === 0 ? (
        <EmptyState icon={FileText} title="Aucun rapport" message="Aucun rapport n'a encore été soumis" />
      ) : (
        <div className="space-y-3">
          {data?.rapports?.map((r: Rapport) => {
            const photos = r.photos ? JSON.parse(r.photos) : [];
            return (
              <div key={r.id} className="card">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold">{r.titre}</h3>
                    <div className="text-xs text-text-muted mt-1">
                      📁 {r.tache?.projet?.nom} • 📋 {r.tache?.titre} • 👤 {r.chefEquipe?.nom} • {formatDate(r.dateCreation)}
                    </div>
                  </div>
                  <span className={statutBadge(r.statutTache)}>{STATUT_TACHE_LABEL[r.statutTache]}</span>
                </div>
                <p className="text-sm">{r.description}</p>
                {r.observations && (
                  <div className="mt-3 p-3 bg-bg-100 rounded-lg text-sm">
                    <div className="text-xs text-text-muted mb-1">Observations</div>
                    {r.observations}
                  </div>
                )}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1"><ProgressBar value={r.avancement} /></div>
                  <span className="text-xs text-text-muted">{r.avancement}%</span>
                </div>
                {photos.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {photos.map((url: string, i: number) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="block">
                        <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-white/10 hover:border-white/30" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <NewRapportModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

function NewRapportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [projetId, setProjetId] = useState('');
  const [form, setForm] = useState({
    tacheId: '', titre: '', description: '',
    statutTache: 'EN_COURS' as StatutTache,
    avancement: 50, observations: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);

  const { data: projets } = useQuery({
    queryKey: ['projets', 'rapport'],
    queryFn: async () => (await api.get('/projets')).data,
    enabled: open,
  });

  const { data: taches } = useQuery({
    queryKey: ['taches', 'rapport'],
    queryFn: async () => (await api.get('/taches')).data,
    enabled: open,
  });

  // Ne garde que les tâches appartenant au projet sélectionné
  const tachesDuProjet = (taches?.taches ?? []).filter(
    (t: Tache) => !projetId || String(t.projetId) === String(projetId)
  );

  const create = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      photos.forEach((p) => fd.append('photos', p));
      return api.post('/rapports', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rapports'] });
      qc.invalidateQueries({ queryKey: ['taches'] });
      toast.success('Rapport soumis');
      onClose();
      setForm({ tacheId: '', titre: '', description: '', statutTache: 'EN_COURS', avancement: 50, observations: '' });
      setProjetId('');
      setPhotos([]);
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erreur'),
  });

  return (
    <Modal open={open} onClose={onClose} title="Nouveau rapport" size="lg">
      <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-4">
        <div><label className="label">Projet concerné</label>
          <select className="input" value={projetId} onChange={(e) => { setProjetId(e.target.value); setForm({ ...form, tacheId: '' }); }}>
            <option value="">— Tous les projets —</option>
            {projets?.projets?.map((p: { id: number; nom: string }) => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
        </div>
        <div><label className="label">Tâche concernée</label>
          <select required className="input" value={form.tacheId} onChange={(e) => setForm({ ...form, tacheId: e.target.value })}>
            <option value="">— Sélectionner —</option>
            {tachesDuProjet.map((t: Tache) => (
              <option key={t.id} value={t.id}>{t.titre} {t.projet ? `(${t.projet.nom})` : ''}</option>
            ))}
          </select>
        </div>
        <div><label className="label">Titre du rapport</label>
          <input required className="input" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} />
        </div>
        <div><label className="label">Description</label>
          <textarea required rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Nouveau statut</label>
            <select className="input" value={form.statutTache} onChange={(e) => setForm({ ...form, statutTache: e.target.value as StatutTache })}>
              {Object.entries(STATUT_TACHE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div><label className="label">Avancement : {form.avancement}%</label>
            <input type="range" min="0" max="100" step="5" className="w-full"
              value={form.avancement}
              onChange={(e) => setForm({ ...form, avancement: parseInt(e.target.value) })} />
          </div>
        </div>
        <div><label className="label">Observations</label>
          <textarea rows={2} className="input" value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} />
        </div>
        <div>
          <label className="label">Photos (max 5)</label>
          <input
            type="file" accept="image/*" multiple
            onChange={(e) => setPhotos(Array.from(e.target.files || []).slice(0, 5))}
            className="block w-full text-sm text-text-muted file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-bg-100 file:text-text hover:file:bg-bg-200"
          />
          {photos.length > 0 && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {photos.map((p, i) => (
                <div key={i} className="flex items-center gap-1 px-2 py-1 bg-bg-100 rounded text-xs">
                  <ImageIcon className="w-3 h-3" /> {p.name}
                  <button type="button" onClick={() => setPhotos(photos.filter((_, j) => j !== i))} className="text-text-dim hover:text-brand-red ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
          <button type="submit" disabled={create.isPending} className="btn-primary">
            {create.isPending ? <Spinner /> : 'Soumettre'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
