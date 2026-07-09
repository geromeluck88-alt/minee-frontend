// src/pages/chefProjet/Dashboard.tsx
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { PageHeader } from '@/components/Layout';
import { StatCard } from '@/components/ui';
import { FolderKanban, Activity, CheckCircle2, ListTodo, AlertTriangle } from 'lucide-react';

export default function ChefProjetDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['stats', 'chefProjet'],
    queryFn: async () => (await api.get('/stats/dashboard')).data,
  });

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Vos projets et tâches" />
      {isLoading ? (
        <div className="text-text-muted">Chargement…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={FolderKanban}  label="Mes projets"        value={data?.totalProjets ?? 0} color="cyan" />
          <StatCard icon={Activity}      label="En cours"            value={data?.projetsEnCours ?? 0} color="green" />
          <StatCard icon={CheckCircle2}  label="Terminés"            value={data?.projetsTermines ?? 0} color="purple" />
          <StatCard icon={ListTodo}      label="Tâches totales"      value={data?.totalTaches ?? 0} color="cyan" />
          <StatCard icon={AlertTriangle} label="Tâches en retard"    value={data?.tachesEnRetard ?? 0} color="red" />
        </div>
      )}
    </>
  );
}
