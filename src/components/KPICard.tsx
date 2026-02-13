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
    <div className="relative overflow-hidden glass rounded-lg p-3.5 group">
      {/* Animated glow effect */}
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${g.glow} blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{title}</p>
          <p className="text-xl font-black text-heading mt-1 tracking-tight truncate leading-none">{value}</p>
          {subtitle && <p className="text-[10px] text-muted mt-1.5">{subtitle}</p>}
        </div>
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${g.icon} flex items-center justify-center shadow-md ${g.shadow} shrink-0 ml-2 group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
    </div>
  );
}
