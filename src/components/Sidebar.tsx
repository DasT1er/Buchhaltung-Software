import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  FileText,
  Users,
  BookOpen,
  Settings,
  Truck,
  X,
  Moon,
  Sun,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/einnahmen', icon: TrendingUp, label: 'Einnahmen' },
  { to: '/ausgaben', icon: TrendingDown, label: 'Ausgaben' },
  { to: '/eur-bericht', icon: FileText, label: 'EÜR-Bericht' },
  { to: '/kunden', icon: Users, label: 'Kunden' },
  { to: '/fahrtenbuch', icon: BookOpen, label: 'Fahrtenbuch' },
  { to: '/einstellungen', icon: Settings, label: 'Einstellungen' },
];

export default function Sidebar({ isOpen, onClose, isDark, onToggleTheme }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-sidebar text-white
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Truck size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">BuchungsProfi</h1>
              <p className="text-[10px] text-slate-400 -mt-0.5">Buchhaltung einfach gemacht</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {navItems.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-sidebar-active text-white shadow-lg shadow-primary-900/30'
                        : 'text-slate-300 hover:bg-sidebar-hover hover:text-white'
                    }`
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 border-t border-white/10">
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-sidebar-hover hover:text-white transition-all duration-200"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <div className="bg-sidebar-hover rounded-lg p-3">
            <p className="text-xs text-slate-400">Geschäftsjahr</p>
            <p className="text-sm font-semibold text-white">{new Date().getFullYear()}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
