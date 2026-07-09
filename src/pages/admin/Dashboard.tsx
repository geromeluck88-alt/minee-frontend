// src/pages/admin/Dashboard.tsx
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { PageHeader } from '@/components/Layout';
import { StatCard } from '@/components/ui';
import { FolderKanban, ListTodo, Users, ShieldCheck, Activity, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['stats', 'admin'],
    queryFn: async () => (await api.get('/stats/dashboard')).data,
  });

  return (
    <>
      <PageHeader title="Tableau de bord administrateur" subtitle="Vue globale de la plateforme" />
      {isLoading ? (
        <div className="text-text-muted">Chargement…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={FolderKanban} label="Projets totaux"   value={data?.totalProjets ?? 0} color="cyan" />
          <StatCard icon={Activity}     label="Projets en cours" value={data?.projetsEnCours ?? 0} color="green" />
          <StatCard icon={ListTodo}     label="Tâches totales"   value={data?.totalTaches ?? 0} color="purple" />
          <StatCard icon={AlertTriangle} label="Tâches en retard" value={data?.tachesEnRetard ?? 0} color="red" />
          <StatCard icon={ShieldCheck}  label="Inspections"      value={data?.totalInspections ?? 0} color="amber" />
          <StatCard icon={Users}        label="Utilisateurs"     value={data?.totalUsers ?? 0} color="cyan" />
        </div>
      )}
    </>
  );
}
