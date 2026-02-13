import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTheme } from '../store/useTheme';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen overflow-hidden bg-page">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isDark={isDark} onToggleTheme={toggleTheme} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto px-3 py-3 lg:px-5 lg:py-4 lg:ml-3">
          <Outlet context={{ onMenuClick: () => setSidebarOpen(true), isDark }} />
        </main>
      </div>
    </div>
  );
}
