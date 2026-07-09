// src/pages/shared/InspectionsListe.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/Layout';
import { Modal, Spinner, EmptyState } from '@/components/ui';
import { STATUT_INSPECTION_LABEL, statutBadge, formatDate } from '@/lib/utils';
import type { Inspection, Projet, StatutInspection } from '@/types';

export default function InspectionsListe() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['inspections'],
    queryFn: async () => (await api.get('/inspections')).data,
  });

  const peutCreer = user?.role === 'ADMIN' || user?.role === 'INSPECTEUR';

  return (
    <>
      <PageHeader
        title="Inspections"
        action={peutCreer && (
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Nouvelle inspection
          </button>
        )}
      />

      {isLoading ? (
        <div className="text-text-muted">Chargement…</div>
      ) : data?.inspections?.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="Aucune inspection" message="Aucune inspection enregistrée" />
      ) : (
        <div className="space-y-3">
          {data?.inspections?.map((i: Inspection) => (
            <div key={i.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-cyan" />
                    <span className="font-semibold">{i.projet?.nom}</span>
                  </div>
                  <div className="text-xs text-text-muted mt-1">
                    {formatDate(i.dateInspection)} • Inspecteur : {i.inspecteur?.nom}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={statutBadge(i.statut)}>{STATUT_INSPECTION_LABEL[i.statut]}</span>
                  {i.conforme !== null && i.conforme !== undefined && (
                    <span className={i.conforme ? 'badge-green' : 'badge-red'}>
                      {i.conforme ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {i.conforme ? 'Conforme' : 'Non conforme'}
                    </span>
                  )}
                </div>
              </div>
              {i.observations && (
                <div className="mt-3 p-3 bg-bg-100 rounded-lg text-sm">
                  <div className="text-xs text-text-muted mb-1">Observations</div>
                  {i.observations}
                </div>
              )}
              {i.recommandations && (
                <div className="mt-2 p-3 bg-brand-amber/5 border border-brand-amber/20 rounded-lg text-sm">
                  <div className="text-xs text-brand-amber mb-1">Recommandations</div>
                  {i.recommandations}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <NewInspectionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

function NewInspectionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    projetId: '', dateInspection: '', observations: '', recommandations: '',
    statut: 'EN_ATTENTE' as StatutInspection, conforme: '' as '' | 'true' | 'false',
  });

  const { data: projets } = useQuery({
    queryKey: ['projets'],
    queryFn: async () => (await api.get('/projets')).data,
    enabled: open,
  });

  const create = useMutation({
    mutationFn: () => api.post('/inspections', {
      ...form,
      conforme: form.conforme === '' ? undefined : form.conforme === 'true',
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inspections'] });
      toast.success('Inspection créée');
      onClose();
      setForm({ projetId: '', dateInspection: '', observations: '', recommandations: '', statut: 'EN_ATTENTE', conforme: '' });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erreur'),
  });

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle inspection" size="lg">
      <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-4">
        <div><label className="label">Projet</label>
          <select required className="input" value={form.projetId} onChange={(e) => setForm({ ...form, projetId: e.target.value })}>
            <option value="">— Sélectionner —</option>
            {projets?.projets?.map((p: Projet) => <option key={p.id} value={p.id}>{p.nom}</option>)}
          </select>
        </div>
        <div><label className="label">Date d'inspection</label>
          <input required type="date" className="input" value={form.dateInspection} onChange={(e) => setForm({ ...form, dateInspection: e.target.value })} />
        </div>
        <div><label className="label">Observations</label>
          <textarea rows={3} className="input" value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} />
        </div>
        <div><label className="label">Recommandations</label>
          <textarea rows={2} className="input" value={form.recommandations} onChange={(e) => setForm({ ...form, recommandations: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Statut</label>
            <select className="input" value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value as StatutInspection })}>
              {Object.entries(STATUT_INSPECTION_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div><label className="label">Conformité</label>
            <select className="input" value={form.conforme} onChange={(e) => setForm({ ...form, conforme: e.target.value as any })}>
              <option value="">À évaluer</option>
              <option value="true">Conforme</option>
              <option value="false">Non conforme</option>
            </select>
          </div>
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
