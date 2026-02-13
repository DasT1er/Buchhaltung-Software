import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Einnahmen from './pages/Einnahmen';
import Ausgaben from './pages/Ausgaben';
import EURBericht from './pages/EURBericht';
import Kunden from './pages/Kunden';
import Fahrtenbuch from './pages/Fahrtenbuch';
import Einstellungen from './pages/Einstellungen';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/einnahmen" element={<Einnahmen />} />
          <Route path="/ausgaben" element={<Ausgaben />} />
          <Route path="/eur-bericht" element={<EURBericht />} />
          <Route path="/kunden" element={<Kunden />} />
          <Route path="/fahrtenbuch" element={<Fahrtenbuch />} />
          <Route path="/einstellungen" element={<Einstellungen />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
