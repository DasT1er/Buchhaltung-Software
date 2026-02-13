import { Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, onMenuClick, actions }: HeaderProps) {
  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-divider px-5 sm:px-8 h-16 flex items-center justify-between no-print sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-muted hover:text-heading rounded-lg hover:bg-card-alt transition-colors"
        >
          <Menu size={22} />
        </button>
        <div>
          <h2 className="text-base font-semibold text-heading leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
