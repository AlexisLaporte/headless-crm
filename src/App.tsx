import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Companies } from './components/Companies';
import { Contacts } from './components/Contacts';
import { Campaigns } from './components/Campaigns';
import { Settings } from './components/Settings';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';

function AppContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'companies' | 'contacts' | 'campaigns' | 'settings'>('companies');

  if (!user) {
    return <Auth />;
  }

  return (
    <DataProvider userId={user.id}>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'companies' && <Companies />}
        {activeTab === 'contacts' && <Contacts />}
        {activeTab === 'campaigns' && <Campaigns />}
        {activeTab === 'settings' && <Settings />}
      </Layout>
    </DataProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <PwaInstallPrompt />
    </AuthProvider>
  );
}

export default App;
