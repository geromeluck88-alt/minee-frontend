// src/pages/chefEquipe/Dashboard.tsx
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { PageHeader } from '@/components/Layout';
import { StatCard } from '@/components/ui';
import { Users, ListTodo, Activity, CheckCircle2, ClipboardList } from 'lucide-react';

export default function ChefEquipeDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['stats', 'chefEquipe'],
    queryFn: async () => (await api.get('/stats/dashboard')).data,
  });

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Vos équipes, tâches et rapports" />
      {isLoading ? (
        <div className="text-text-muted">Chargement…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={Users}         label="Mes équipes"      value={data?.totalEquipes ?? 0} color="cyan" />
          <StatCard icon={ListTodo}      label="Mes tâches"       value={data?.totalTaches ?? 0} color="purple" />
          <StatCard icon={Activity}      label="En cours"         value={data?.tachesEnCours ?? 0} color="amber" />
          <StatCard icon={CheckCircle2}  label="Terminées"        value={data?.tachesTerminees ?? 0} color="green" />
          <StatCard icon={ClipboardList} label="Rapports soumis"  value={data?.totalRapports ?? 0} color="cyan" />
        </div>
      )}
    </>
  );
}
