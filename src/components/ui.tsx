// src/components/ui.tsx
import { ReactNode } from 'react';
import { X } from 'lucide-react';

export function StatCard({ icon: Icon, label, value, color = 'cyan' }: {
  icon: any; label: string; value: ReactNode;
  color?: 'cyan' | 'green' | 'amber' | 'red' | 'purple';
}) {
  const colorClasses: Record<string, string> = {
    cyan:   'text-brand-cyan bg-brand-cyan/10',
    green:  'text-brand-green bg-brand-green/10',
    amber:  'text-brand-amber bg-brand-amber/10',
    red:    'text-brand-red bg-brand-red/10',
    purple: 'text-brand-purple bg-brand-purple/10',
  };
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-text-muted text-sm">{label}</div>
          <div className="text-3xl font-bold mt-2">{value}</div>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children, size = 'md' }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  if (!open) return null;
  const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full ${sizeClasses[size]} max-h-[90vh] bg-bg-50 border border-white/10 rounded-xl shadow-2xl flex flex-col`}>
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return <div className={`w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin ${className}`} />;
}

export function EmptyState({ icon: Icon, title, message, action }: {
  icon: any; title: string; message: string; action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-full bg-bg-100 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-text-muted" />
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-text-muted text-sm mb-4 max-w-sm">{message}</p>
      {action}
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(100, value));
  const color = safe >= 100 ? 'bg-brand-green' : safe >= 50 ? 'bg-brand-cyan' : 'bg-brand-amber';
  return (
    <div className="w-full bg-bg-100 rounded-full h-2 overflow-hidden">
      <div className={`h-full ${color} transition-all`} style={{ width: `${safe}%` }} />
    </div>
  );
}
