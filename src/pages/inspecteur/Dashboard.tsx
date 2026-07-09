// src/pages/inspecteur/Dashboard.tsx
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { PageHeader } from '@/components/Layout';
import { StatCard } from '@/components/ui';
import { ShieldCheck, Activity, CheckCircle2, Clock } from 'lucide-react';

export default function InspecteurDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['stats', 'inspecteur'],
    queryFn: async () => (await api.get('/stats/dashboard')).data,
  });

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Vos inspections" />
      {isLoading ? (
        <div className="text-text-muted">Chargement…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={ShieldCheck}  label="Total"       value={data?.totalInspections ?? 0} color="cyan" />
          <StatCard icon={Clock}        label="En attente"  value={data?.enAttente ?? 0} color="amber" />
          <StatCard icon={Activity}     label="En cours"    value={data?.enCours ?? 0} color="purple" />
          <StatCard icon={CheckCircle2} label="Terminées"   value={data?.terminees ?? 0} color="green" />
        </div>
      )}
    </>
  );
}
