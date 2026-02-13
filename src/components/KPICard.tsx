import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'amber';
}

const gradients = {
  blue: {
    icon: 'from-primary-500 to-primary-700',
    shadow: 'shadow-primary-500/25',
    glow: 'bg-primary-500/10 dark:bg-primary-500/5',
  },
  green: {
    icon: 'from-emerald-500 to-emerald-700',
    shadow: 'shadow-emerald-500/25',
    glow: 'bg-emerald-500/10 dark:bg-emerald-500/5',
  },
  red: {
    icon: 'from-rose-500 to-rose-700',
    shadow: 'shadow-rose-500/25',
    glow: 'bg-rose-500/10 dark:bg-rose-500/5',
  },
  amber: {
    icon: 'from-amber-500 to-amber-600',
    shadow: 'shadow-amber-500/25',
    glow: 'bg-amber-500/10 dark:bg-amber-500/5',
  },
};

export default function KPICard({ title, value, subtitle, icon: Icon, color }: KPICardProps) {
  const g = gradients[color];

  return (
    <div className="relative overflow-hidden bg-card rounded-2xl border border-divider-light p-5 transition-all duration-200 hover:border-divider" style={{ boxShadow: 'var(--card-shadow)' }}>
      {/* Subtle glow in top-right */}
      <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${g.glow} blur-2xl`} />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-muted">{title}</p>
          <p className="text-[26px] font-bold text-heading mt-1.5 tracking-tight truncate leading-none">{value}</p>
          {subtitle && <p className="text-xs text-muted mt-2">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${g.icon} flex items-center justify-center shadow-lg ${g.shadow} shrink-0 ml-3`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}
