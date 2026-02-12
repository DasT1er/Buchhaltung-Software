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
    bg: 'bg-primary-50',
    icon: 'text-primary-600',
    ring: 'ring-primary-100',
  },
  green: {
    bg: 'bg-success-50',
    icon: 'text-success-600',
    ring: 'ring-success-100',
  },
  red: {
    bg: 'bg-danger-50',
    icon: 'text-danger-600',
    ring: 'ring-danger-100',
  },
  amber: {
    bg: 'bg-warning-50',
    icon: 'text-warning-600',
    ring: 'ring-warning-100',
  },
};

export default function KPICard({ title, value, subtitle, icon: Icon, color, trend }: KPICardProps) {
  const colors = colorMap[color];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1 truncate">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs font-medium mt-2 ${trend.positive ? 'text-success-600' : 'text-danger-600'}`}>
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
