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

const sections = [
  {
    title: 'ÜBERSICHT',
    items: [{ to: '/', icon: LayoutDashboard, label: 'Dashboard' }],
  },
  {
    title: 'FINANZEN',
    items: [
      { to: '/einnahmen', icon: TrendingUp, label: 'Einnahmen' },
      { to: '/ausgaben', icon: TrendingDown, label: 'Ausgaben' },
      { to: '/eur-bericht', icon: FileText, label: 'EÜR-Bericht' },
    ],
  },
  {
    title: 'VERWALTUNG',
    items: [
      { to: '/kunden', icon: Users, label: 'Kunden' },
      { to: '/fahrtenbuch', icon: BookOpen, label: 'Fahrtenbuch' },
      { to: '/einstellungen', icon: Settings, label: 'Einstellungen' },
    ],
  },
];

export default function Sidebar({ isOpen, onClose, isDark, onToggleTheme }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[240px] glass border-r border-divider/30
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-4 shrink-0 border-b border-divider/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-md shadow-primary-500/30">
              <Truck size={15} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-heading tracking-tight leading-tight">BuchungsProfi</h1>
              <p className="text-[9px] text-muted leading-tight">Buchhaltung einfach</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-muted hover:text-heading transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
          {sections.map(section => (
            <div key={section.title}>
              <p className="text-[9px] font-black uppercase tracking-wider text-muted px-2.5 mb-1.5">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map(item => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? 'bg-gradient-to-br from-primary-500/20 to-primary-700/20 text-primary-400 shadow-sm'
                            : 'text-muted hover:bg-card-alt/40 hover:text-heading backdrop-blur-sm'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-all ${
                            isActive ? 'bg-gradient-to-br from-primary-500 to-primary-700 shadow-md shadow-primary-500/30' : 'bg-card-alt/60 group-hover:bg-card-alt backdrop-blur-sm'
                          }`}>
                            <item.icon size={14} className={isActive ? 'text-white' : ''} />
                          </div>
                          {item.label}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 p-2.5 space-y-2 border-t border-divider/30">
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted hover:bg-card-alt/40 hover:text-heading transition-all backdrop-blur-sm"
          >
            <div className="w-7 h-7 rounded-md bg-card-alt/60 flex items-center justify-center backdrop-blur-sm">
              {isDark ? <Sun size={13} /> : <Moon size={13} />}
            </div>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <div className="mx-1.5 rounded-lg glass px-2.5 py-2">
            <p className="text-[9px] font-black text-muted uppercase tracking-wider">Geschäftsjahr</p>
            <p className="text-xs font-black text-heading mt-0.5">{new Date().getFullYear()}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
