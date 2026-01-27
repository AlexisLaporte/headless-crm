import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { AuthGuard, GuestGuard } from './components/AuthGuard';
import { Layout } from './components/Layout';
import { Companies } from './components/Companies';
import { CompanyDetail } from './components/CompanyDetail';
import { Contacts } from './components/Contacts';
import { Campaigns } from './components/Campaigns';
import { CampaignDetail } from './components/CampaignDetail';
import { Settings } from './components/Settings';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Guest routes */}
        <Route element={<GuestGuard />}>
          <Route path="/" element={<Auth />} />
        </Route>

        {/* Authenticated routes */}
        <Route element={<AuthGuard />}>
          <Route path="/app" element={<Layout />}>
            <Route index element={<Navigate to="companies" replace />} />
            <Route path="companies" element={<Companies />} />
            <Route path="companies/:id" element={<CompanyDetail />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="campaigns/:id" element={<CampaignDetail />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PwaInstallPrompt />
    </AuthProvider>
  );
}

export default App;
