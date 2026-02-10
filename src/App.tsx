import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { AuthGuard, GuestGuard } from './components/AuthGuard';
import { Layout } from './components/Layout';
import { Organizations } from './components/Organizations';
import { OrganizationDetail } from './components/OrganizationDetail';
import { People } from './components/People';
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
            <Route index element={<Navigate to="organizations" replace />} />
            <Route path="organizations" element={<Organizations />} />
            <Route path="organizations/:id" element={<OrganizationDetail />} />
            <Route path="people" element={<People />} />
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
