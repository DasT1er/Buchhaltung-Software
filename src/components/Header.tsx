import { Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, onMenuClick, actions }: HeaderProps) {
  return (
    <header className="glass border-b border-divider/50 px-0 h-14 flex items-center justify-between no-print mb-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 text-muted hover:text-heading rounded-lg hover:bg-card-alt/40 transition-colors backdrop-blur-sm"
        >
          <Menu size={20} />
        </button>
        <div>
          <h2 className="text-sm font-black text-heading leading-tight tracking-tight">{title}</h2>
          {subtitle && <p className="text-[10px] text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
