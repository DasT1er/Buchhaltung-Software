import { Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, onMenuClick, actions }: HeaderProps) {
  return (
    <header className="bg-card border-b border-divider px-4 sm:px-6 h-16 flex items-center justify-between no-print transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-muted hover:text-heading transition-colors"
        >
          <Menu size={24} />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-heading">{title}</h2>
          {subtitle && (
            <p className="text-xs text-body">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
