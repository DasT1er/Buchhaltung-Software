import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'amber';
  trend?: {
    value: string;
    positive: boolean;
  };
}

const colorMap = {
  blue: {
    bg: 'bg-p-tint',
    icon: 'text-primary-600 dark:text-primary-400',
    ring: 'ring-p-tint-border',
  },
  green: {
    bg: 'bg-s-tint',
    icon: 'text-success-600 dark:text-success-400',
    ring: 'ring-s-tint-border',
  },
  red: {
    bg: 'bg-d-tint',
    icon: 'text-danger-600 dark:text-danger-400',
    ring: 'ring-d-tint-border',
  },
  amber: {
    bg: 'bg-w-tint',
    icon: 'text-warning-600 dark:text-warning-400',
    ring: 'ring-w-tint-border',
  },
};

export default function KPICard({ title, value, subtitle, icon: Icon, color, trend }: KPICardProps) {
  const colors = colorMap[color];

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-divider-light hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-body">{title}</p>
          <p className="text-2xl font-bold text-heading mt-1 truncate">{value}</p>
          {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs font-medium mt-2 ${trend.positive ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
              {trend.positive ? '+' : ''}{trend.value}
            </p>
          )}
        </div>
        <div className={`${colors.bg} ${colors.ring} ring-4 p-3 rounded-xl`}>
          <Icon size={22} className={colors.icon} />
        </div>
      </div>
    </div>
  );
}
