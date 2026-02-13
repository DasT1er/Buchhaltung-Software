import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Car, BarChart3 } from 'lucide-react';
import Header from '../components/Header';
import KPICard from '../components/KPICard';
import { formatCurrency, formatMonth } from '../utils/formatters';
import { getEinnahmeKategorieLabel, getAusgabeKategorieLabel } from '../utils/categories';
import type { Einnahme, Ausgabe } from '../types';
import { useStore } from '../store/useStore';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function Dashboard() {
  const { onMenuClick, isDark } = useOutletContext<{ onMenuClick: () => void; isDark: boolean }>();
  const { einnahmen, ausgaben, fahrten, geschaeftsjahr } = useStore();

  const chartGrid = isDark ? '#1e3050' : '#e2e8f0';
  const chartText = isDark ? '#64748b' : '#94a3b8';
  const tooltipBg = isDark ? '#152037' : '#ffffff';
  const tooltipBorder = isDark ? '#1e3050' : '#e2e8f0';
  const tooltipText = isDark ? '#f1f5f9' : '#0f172a';
  const legendText = isDark ? '#94a3b8' : '#475569';

  const jahresEinnahmen = useMemo(() => einnahmen.filter(e => new Date(e.datum).getFullYear() === geschaeftsjahr), [einnahmen, geschaeftsjahr]);
  const jahresAusgaben = useMemo(() => ausgaben.filter(a => new Date(a.datum).getFullYear() === geschaeftsjahr), [ausgaben, geschaeftsjahr]);
  const jahresFahrten = useMemo(() => fahrten.filter(f => new Date(f.datum).getFullYear() === geschaeftsjahr), [fahrten, geschaeftsjahr]);

  const gesamtEinnahmen = useMemo(() => jahresEinnahmen.reduce((s, e) => s + e.betrag, 0), [jahresEinnahmen]);
  const gesamtAusgaben = useMemo(() => jahresAusgaben.reduce((s, a) => s + a.betrag, 0), [jahresAusgaben]);
  const gewinn = gesamtEinnahmen - gesamtAusgaben;
  const gesamtKilometer = useMemo(() => jahresFahrten.reduce((s, f) => s + f.kilometer, 0), [jahresFahrten]);

  const monatsDaten = useMemo(() => {
    const daten = Array.from({ length: 12 }, (_, i) => ({ monat: formatMonth(i), einnahmen: 0, ausgaben: 0 }));
    jahresEinnahmen.forEach(e => { daten[new Date(e.datum).getMonth()].einnahmen += e.betrag; });
    jahresAusgaben.forEach(a => { daten[new Date(a.datum).getMonth()].ausgaben += a.betrag; });
    return daten;
  }, [jahresEinnahmen, jahresAusgaben]);

  const einnahmenByKat = useMemo(() => {
    const map: Record<string, number> = {};
    jahresEinnahmen.forEach(e => { map[e.kategorie] = (map[e.kategorie] ?? 0) + e.betrag; });
    return Object.entries(map).map(([kategorie, betrag]) => ({ name: getEinnahmeKategorieLabel(kategorie as any), value: betrag })).sort((a, b) => b.value - a.value);
  }, [jahresEinnahmen]);

  const ausgabenByKat = useMemo(() => {
    const map: Record<string, number> = {};
    jahresAusgaben.forEach(a => { map[a.kategorie] = (map[a.kategorie] ?? 0) + a.betrag; });
    return Object.entries(map).map(([kategorie, betrag]) => ({ name: getAusgabeKategorieLabel(kategorie as any), value: betrag })).sort((a, b) => b.value - a.value);
  }, [jahresAusgaben]);

  const kumulativDaten = useMemo(() => {
    let kumE = 0, kumA = 0;
    return monatsDaten.map(m => { kumE += m.einnahmen; kumA += m.ausgaben; return { monat: m.monat, einnahmen: kumE, ausgaben: kumA, gewinn: kumE - kumA }; });
  }, [monatsDaten]);

  const letzte5Einnahmen = useMemo(() => [...jahresEinnahmen].sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()).slice(0, 5), [jahresEinnahmen]);
  const letzte5Ausgaben = useMemo(() => [...jahresAusgaben].sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()).slice(0, 5), [jahresAusgaben]);

  const tooltipFormatter = (value: number | undefined) => formatCurrency(value ?? 0);
  const tooltipStyle = { backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: '12px', border: `1px solid ${tooltipBorder}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };

  function EmptyChart({ label }: { label: string }) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-card-alt flex items-center justify-center mb-3">
          <BarChart3 size={20} className="text-muted" />
        </div>
        <p className="text-sm font-medium text-muted">{label}</p>
        <p className="text-xs text-muted mt-1">Daten werden hier angezeigt</p>
      </div>
    );
  }

  const hasData = jahresEinnahmen.length > 0 || jahresAusgaben.length > 0;

  return (
    <>
      <Header title="Dashboard" subtitle={`Übersicht für ${geschaeftsjahr}`} onMenuClick={onMenuClick} />

      <div className="p-4 sm:p-6 space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard title="Einnahmen" value={formatCurrency(gesamtEinnahmen)} subtitle={`${jahresEinnahmen.length} Buchungen`} icon={TrendingUp} color="green" />
          <KPICard title="Ausgaben" value={formatCurrency(gesamtAusgaben)} subtitle={`${jahresAusgaben.length} Buchungen`} icon={TrendingDown} color="red" />
          <KPICard title="Gewinn / Verlust" value={formatCurrency(gewinn)} subtitle="Einnahmen - Ausgaben" icon={Wallet} color={gewinn >= 0 ? 'blue' : 'red'} />
          <KPICard title="Gefahrene km" value={`${gesamtKilometer.toLocaleString('de-DE')} km`} subtitle={`${jahresFahrten.length} Fahrten`} icon={Car} color="amber" />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="glass rounded-lg p-4">
            <h3 className="text-xs font-bold text-heading mb-3 uppercase tracking-wide">Monatsübersicht</h3>
            <div className="h-64">
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monatsDaten} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} vertical={false} />
                    <XAxis dataKey="monat" tick={{ fontSize: 11, fill: chartText }} tickFormatter={v => v.slice(0, 3)} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: chartText }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                    <Tooltip formatter={tooltipFormatter} contentStyle={tooltipStyle} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }} />
                    <Bar dataKey="einnahmen" fill="#22c55e" name="Einnahmen" radius={[6, 6, 0, 0]} maxBarSize={32} />
                    <Bar dataKey="ausgaben" fill="#ef4444" name="Ausgaben" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyChart label="Noch keine Buchungen" />}
            </div>
          </div>

          <div className="glass rounded-lg p-4">
            <h3 className="text-xs font-bold text-heading mb-3 uppercase tracking-wide">Kumulativer Verlauf</h3>
            <div className="h-60">
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={kumulativDaten} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} vertical={false} />
                    <XAxis dataKey="monat" tick={{ fontSize: 11, fill: chartText }} tickFormatter={v => v.slice(0, 3)} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: chartText }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                    <Tooltip formatter={tooltipFormatter} contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="einnahmen" stroke="#22c55e" fill={isDark ? 'rgba(34,197,94,0.1)' : '#dcfce7'} name="Einnahmen" strokeWidth={2} />
                    <Area type="monotone" dataKey="ausgaben" stroke="#ef4444" fill={isDark ? 'rgba(239,68,68,0.1)' : '#fee2e2'} name="Ausgaben" strokeWidth={2} />
                    <Area type="monotone" dataKey="gewinn" stroke="#6366f1" fill={isDark ? 'rgba(99,102,241,0.1)' : '#e0e7ff'} name="Gewinn" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <EmptyChart label="Noch keine Buchungen" />}
            </div>
          </div>
        </div>

        {/* Charts Row 2 - Pie Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="glass rounded-lg p-4">
            <h3 className="text-xs font-bold text-heading mb-3 uppercase tracking-wide">Einnahmen nach Kategorie</h3>
            <div className="h-60">
              {einnahmenByKat.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={einnahmenByKat} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                      {einnahmenByKat.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                    </Pie>
                    <Tooltip formatter={tooltipFormatter} contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} formatter={(value: string) => <span style={{ color: legendText }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <EmptyChart label="Noch keine Einnahmen erfasst" />}
            </div>
          </div>

          <div className="glass rounded-lg p-4">
            <h3 className="text-xs font-bold text-heading mb-3 uppercase tracking-wide">Ausgaben nach Kategorie</h3>
            <div className="h-60">
              {ausgabenByKat.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ausgabenByKat} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                      {ausgabenByKat.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                    </Pie>
                    <Tooltip formatter={tooltipFormatter} contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} formatter={(value: string) => <span style={{ color: legendText }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <EmptyChart label="Noch keine Ausgaben erfasst" />}
            </div>
          </div>
        </div>

        {/* Recent Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <RecentList title="Letzte Einnahmen" items={letzte5Einnahmen} type="einnahme" />
          <RecentList title="Letzte Ausgaben" items={letzte5Ausgaben} type="ausgabe" />
        </div>
      </div>
    </>
  );
}

function RecentList({ title, items, type }: { title: string; items: (Einnahme | Ausgabe)[]; type: 'einnahme' | 'ausgabe' }) {
  return (
    <div className="glass rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-divider">
        <h3 className="text-xs font-bold text-heading uppercase tracking-wide">{title}</h3>
      </div>
      {items.length > 0 ? (
        <ul className="divide-y divide-divider">
          {items.map(item => (
            <li key={item.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-card-alt/40 transition-colors">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-heading truncate">{item.beschreibung}</p>
                <p className="text-[10px] text-muted mt-0.5">{new Intl.DateTimeFormat('de-DE').format(new Date(item.datum))}</p>
              </div>
              <span className={`text-xs font-bold ml-3 whitespace-nowrap ${type === 'einnahme' ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                {type === 'einnahme' ? '+' : '-'}{formatCurrency(item.betrag)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-4 py-8 text-center">
          <p className="text-xs text-muted">Noch keine Buchungen vorhanden</p>
        </div>
      )}
    </div>
  );
}
