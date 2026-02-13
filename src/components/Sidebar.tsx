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
          fixed top-0 left-0 z-50 h-full w-[260px] bg-sidebar
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-900/40">
              <Truck size={17} className="text-white" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-white tracking-tight leading-tight">BuchungsProfi</h1>
              <p className="text-[10px] text-slate-500 leading-tight">Buchhaltung einfach gemacht</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {sections.map(section => (
            <div key={section.title}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 px-3 mb-2">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map(item => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                          isActive
                            ? 'bg-primary-600/20 text-primary-300'
                            : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isActive ? 'bg-primary-600 shadow-md shadow-primary-900/40' : 'bg-white/[0.04] group-hover:bg-white/[0.08]'
                          }`}>
                            <item.icon size={16} className={isActive ? 'text-white' : ''} />
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
        <div className="shrink-0 p-3 space-y-2 border-t border-white/[0.06]">
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-400 hover:bg-white/[0.05] hover:text-slate-200 transition-all duration-150"
          >
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </div>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <div className="mx-2 rounded-lg bg-white/[0.04] px-3 py-2.5">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Geschäftsjahr</p>
            <p className="text-sm font-bold text-white mt-0.5">{new Date().getFullYear()}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
