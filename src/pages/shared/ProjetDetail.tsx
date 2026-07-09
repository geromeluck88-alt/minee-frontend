// src/pages/shared/ProjetDetail.tsx
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, User, DollarSign, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  STATUT_PROJET_LABEL, STATUT_TACHE_LABEL, statutBadge, prioriteBadge,
  PRIORITE_LABEL, formatDate, formatMoney,
} from '@/lib/utils';
import { ProgressBar } from '@/components/ui';

export default function ProjetDetail({ basePath }: { basePath: string }) {
  const { id } = useParams();
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['projet', id],
    queryFn: async () => (await api.get(`/projets/${id}`)).data,
  });

  if (isLoading) return <div className="text-text-muted">Chargement…</div>;
  if (!data?.projet) return <div className="text-text-muted">Projet non trouvé</div>;
  const p = data.projet;

  const total = p.taches?.length ?? 0;
  const termines = p.taches?.filter((t: any) => t.statut === 'TERMINE').length ?? 0;
  const avancement = total > 0 ? Math.round((termines / total) * 100) : 0;

  return (
    <>
      <Link to={basePath} className="inline-flex items-center gap-2 text-text-muted hover:text-text mb-4 text-sm">
        <ArrowLeft className="w-4 h-4" /> Retour aux projets
      </Link>

      <div className="card mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{p.nom}</h1>
            <p className="text-text-muted">{p.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={statutBadge(p.statut)}>{STATUT_PROJET_LABEL[p.statut as keyof typeof STATUT_PROJET_LABEL]}</span>
            <span className={prioriteBadge(p.priorite)}>{PRIORITE_LABEL[p.priorite as keyof typeof PRIORITE_LABEL]}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
          <Info icon={Calendar} label="Date début" value={formatDate(p.dateDebut)} />
          <Info icon={Calendar} label="Date fin"   value={formatDate(p.dateFin)} />
          <Info icon={User}     label="Chef projet" value={p.chefProjet?.nom} />
          <Info icon={DollarSign} label="Budget"    value={formatMoney(p.budget)} />
        </div>

        <div className="mt-6 pt-6 border-t border-white/5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-text-muted">Avancement global</span>
            <span className="font-semibold">{avancement}% ({termines}/{total} tâches)</span>
          </div>
          <ProgressBar value={avancement} />
        </div>
      </div>

      {/* Tâches */}
      <div className="card mb-6">
        <h2 className="font-semibold mb-4">Tâches ({p.taches?.length ?? 0})</h2>
        {p.taches?.length === 0 ? (
          <p className="text-text-muted text-sm">Aucune tâche pour ce projet</p>
        ) : (
          <div className="space-y-2">
            {p.taches?.map((t: any) => (
              <div key={t.id} className="p-3 rounded-lg bg-bg-100 border border-white/5 hover:border-white/10 transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{t.titre}</div>
                    {t.description && <div className="text-text-muted text-xs mt-0.5 line-clamp-1">{t.description}</div>}
                    <div className="text-xs text-text-dim mt-1">
                      Échéance : {formatDate(t.dateFinPrevue)}{t.assigneA && ` • ${t.assigneA.nom}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={statutBadge(t.statut)}>{STATUT_TACHE_LABEL[t.statut as keyof typeof STATUT_TACHE_LABEL]}</span>
                    <div className="text-xs text-text-muted mt-1">{t.avancement}%</div>
                  </div>
                </div>
                <div className="mt-2"><ProgressBar value={t.avancement} /></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Équipes */}
      {p.equipes?.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">Équipes ({p.equipes.length})</h2>
          <div className="space-y-2">
            {p.equipes.map((e: any) => (
              <div key={e.id} className="p-3 rounded-lg bg-bg-100 border border-white/5">
                <div className="font-medium">{e.nom}</div>
                <div className="text-xs text-text-muted mt-1">
                  Chef : {e.chefEquipe?.nom} • {e.membres?.length ?? 0} membres
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspections */}
      {p.inspections?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Inspections ({p.inspections.length})
          </h2>
          <div className="space-y-2">
            {p.inspections.map((i: any) => (
              <div key={i.id} className="p-3 rounded-lg bg-bg-100 border border-white/5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-sm">{formatDate(i.dateInspection)}</div>
                    <div className="text-xs text-text-muted mt-1">Par {i.inspecteur?.nom}</div>
                    {i.observations && <div className="text-sm mt-2">{i.observations}</div>}
                  </div>
                  <span className={i.conforme ? 'badge-green' : i.conforme === false ? 'badge-red' : 'badge-amber'}>
                    {i.conforme === true ? 'Conforme' : i.conforme === false ? 'Non conforme' : 'En cours'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-text-muted text-xs mb-1">
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <div className="font-medium">{value || '—'}</div>
    </div>
  );
}
