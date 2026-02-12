import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Car } from 'lucide-react';
import Header from '../components/Header';
import KPICard from '../components/KPICard';
import { formatCurrency, formatMonth } from '../utils/formatters';
import { getEinnahmeKategorieLabel, getAusgabeKategorieLabel } from '../utils/categories';
import type { Einnahme, Ausgabe } from '../types';
import { useStore } from '../store/useStore';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function Dashboard() {
  const { onMenuClick, isDark } = useOutletContext<{ onMenuClick: () => void; isDark: boolean }>();
  const { einnahmen, ausgaben, fahrten, geschaeftsjahr } = useStore();

  const chartGrid = isDark ? '#334155' : '#e2e8f0';
  const chartText = isDark ? '#94a3b8' : '#64748b';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';
  const tooltipText = isDark ? '#f1f5f9' : '#1e293b';
  const legendText = isDark ? '#94a3b8' : '#475569';

  const jahresEinnahmen = useMemo(
    () => einnahmen.filter(e => new Date(e.datum).getFullYear() === geschaeftsjahr),
    [einnahmen, geschaeftsjahr],
  );

  const jahresAusgaben = useMemo(
    () => ausgaben.filter(a => new Date(a.datum).getFullYear() === geschaeftsjahr),
    [ausgaben, geschaeftsjahr],
  );

  const jahresFahrten = useMemo(
    () => fahrten.filter(f => new Date(f.datum).getFullYear() === geschaeftsjahr),
    [fahrten, geschaeftsjahr],
  );

  const gesamtEinnahmen = useMemo(() => jahresEinnahmen.reduce((s, e) => s + e.betrag, 0), [jahresEinnahmen]);
  const gesamtAusgaben = useMemo(() => jahresAusgaben.reduce((s, a) => s + a.betrag, 0), [jahresAusgaben]);
  const gewinn = gesamtEinnahmen - gesamtAusgaben;
  const gesamtKilometer = useMemo(() => jahresFahrten.reduce((s, f) => s + f.kilometer, 0), [jahresFahrten]);

  const monatsDaten = useMemo(() => {
    const daten = Array.from({ length: 12 }, (_, i) => ({
      monat: formatMonth(i),
      einnahmen: 0,
      ausgaben: 0,
    }));
    jahresEinnahmen.forEach(e => { daten[new Date(e.datum).getMonth()].einnahmen += e.betrag; });
    jahresAusgaben.forEach(a => { daten[new Date(a.datum).getMonth()].ausgaben += a.betrag; });
    return daten;
  }, [jahresEinnahmen, jahresAusgaben]);

  const einnahmenByKat = useMemo(() => {
    const map: Record<string, number> = {};
    jahresEinnahmen.forEach(e => { map[e.kategorie] = (map[e.kategorie] ?? 0) + e.betrag; });
    return Object.entries(map)
      .map(([kategorie, betrag]) => ({ name: getEinnahmeKategorieLabel(kategorie as any), value: betrag }))
      .sort((a, b) => b.value - a.value);
  }, [jahresEinnahmen]);

  const ausgabenByKat = useMemo(() => {
    const map: Record<string, number> = {};
    jahresAusgaben.forEach(a => { map[a.kategorie] = (map[a.kategorie] ?? 0) + a.betrag; });
    return Object.entries(map)
      .map(([kategorie, betrag]) => ({ name: getAusgabeKategorieLabel(kategorie as any), value: betrag }))
      .sort((a, b) => b.value - a.value);
  }, [jahresAusgaben]);

  const kumulativDaten = useMemo(() => {
    let kumE = 0;
    let kumA = 0;
    return monatsDaten.map(m => {
      kumE += m.einnahmen;
      kumA += m.ausgaben;
      return { monat: m.monat, einnahmen: kumE, ausgaben: kumA, gewinn: kumE - kumA };
    });
  }, [monatsDaten]);

  const letzte5Einnahmen = useMemo(
    () => [...jahresEinnahmen].sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()).slice(0, 5),
    [jahresEinnahmen],
  );

  const letzte5Ausgaben = useMemo(
    () => [...jahresAusgaben].sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()).slice(0, 5),
    [jahresAusgaben],
  );

  const tooltipFormatter = (value: number | undefined) => formatCurrency(value ?? 0);
  const tooltipStyle = { backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: '8px' };

  return (
    <>
      <Header title="Dashboard" subtitle={`Übersicht für ${geschaeftsjahr}`} onMenuClick={onMenuClick} />

      <div className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Einnahmen" value={formatCurrency(gesamtEinnahmen)} subtitle={`${jahresEinnahmen.length} Buchungen`} icon={TrendingUp} color="green" />
          <KPICard title="Ausgaben" value={formatCurrency(gesamtAusgaben)} subtitle={`${jahresAusgaben.length} Buchungen`} icon={TrendingDown} color="red" />
          <KPICard title="Gewinn / Verlust" value={formatCurrency(gewinn)} subtitle="Einnahmen - Ausgaben" icon={Wallet} color={gewinn >= 0 ? 'blue' : 'red'} />
          <KPICard title="Gefahrene km" value={`${gesamtKilometer.toLocaleString('de-DE')} km`} subtitle={`${jahresFahrten.length} Fahrten`} icon={Car} color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-5 shadow-sm border border-divider-light transition-colors">
            <h3 className="text-sm font-semibold text-heading mb-4">Monatsübersicht</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monatsDaten} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                  <XAxis dataKey="monat" tick={{ fontSize: 11, fill: chartText }} tickFormatter={v => v.slice(0, 3)} />
                  <YAxis tick={{ fontSize: 11, fill: chartText }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={tooltipFormatter} contentStyle={tooltipStyle} />
                  <Bar dataKey="einnahmen" fill="#22c55e" name="Einnahmen" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ausgaben" fill="#ef4444" name="Ausgaben" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 shadow-sm border border-divider-light transition-colors">
            <h3 className="text-sm font-semibold text-heading mb-4">Kumulativer Verlauf</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kumulativDaten} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                  <XAxis dataKey="monat" tick={{ fontSize: 11, fill: chartText }} tickFormatter={v => v.slice(0, 3)} />
                  <YAxis tick={{ fontSize: 11, fill: chartText }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={tooltipFormatter} contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="einnahmen" stroke="#22c55e" fill={isDark ? 'rgba(34,197,94,0.15)' : '#dcfce7'} name="Einnahmen" />
                  <Area type="monotone" dataKey="ausgaben" stroke="#ef4444" fill={isDark ? 'rgba(239,68,68,0.15)' : '#fee2e2'} name="Ausgaben" />
                  <Area type="monotone" dataKey="gewinn" stroke="#3b82f6" fill={isDark ? 'rgba(59,130,246,0.15)' : '#dbeafe'} name="Gewinn" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-5 shadow-sm border border-divider-light transition-colors">
            <h3 className="text-sm font-semibold text-heading mb-4">Einnahmen nach Kategorie</h3>
            <div className="h-64">
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
              ) : (
                <div className="h-full flex items-center justify-center text-muted text-sm">Noch keine Einnahmen erfasst</div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 shadow-sm border border-divider-light transition-colors">
            <h3 className="text-sm font-semibold text-heading mb-4">Ausgaben nach Kategorie</h3>
            <div className="h-64">
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
              ) : (
                <div className="h-full flex items-center justify-center text-muted text-sm">Noch keine Ausgaben erfasst</div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentList title="Letzte Einnahmen" items={letzte5Einnahmen} type="einnahme" />
          <RecentList title="Letzte Ausgaben" items={letzte5Ausgaben} type="ausgabe" />
        </div>
      </div>
    </>
  );
}

function RecentList({ title, items, type }: { title: string; items: (Einnahme | Ausgabe)[]; type: 'einnahme' | 'ausgabe' }) {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-divider-light transition-colors">
      <div className="px-5 py-4 border-b border-divider-light">
        <h3 className="text-sm font-semibold text-heading">{title}</h3>
      </div>
      {items.length > 0 ? (
        <ul className="divide-y divide-divider-light">
          {items.map(item => (
            <li key={item.id} className="px-5 py-3 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-heading truncate">{item.beschreibung}</p>
                <p className="text-xs text-muted">{new Intl.DateTimeFormat('de-DE').format(new Date(item.datum))}</p>
              </div>
              <span className={`text-sm font-semibold ${type === 'einnahme' ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                {type === 'einnahme' ? '+' : '-'}{formatCurrency(item.betrag)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-5 py-8 text-center text-muted text-sm">Noch keine Buchungen vorhanden</div>
      )}
    </div>
  );
}
