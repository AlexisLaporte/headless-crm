import { useAuth } from '../contexts/AuthContext';
import { demoUsers, DemoUser } from '../data/seed';
import { LayoutDashboard, ArrowRight } from 'lucide-react';

export function Auth() {
  const { signIn } = useAuth();

  const handleSelect = (user: DemoUser) => {
    signIn(user);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-brand-950">
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/50 to-brand-950/30" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-accent-500 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-brand-950" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">YACRM</span>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Yet Another CRM<br />Demo Mode
          </h2>
          <p className="text-brand-200 text-lg leading-relaxed max-w-md">
            Gérez vos entreprises, contacts et campagnes marketing depuis une interface simple et performante.
          </p>
          <div className="flex gap-8 mt-8 pt-8 border-t border-white/15">
            <div>
              <p className="text-2xl font-bold text-white">8</p>
              <p className="text-sm text-brand-300">Entreprises</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">14</p>
              <p className="text-sm text-brand-300">Contacts</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">5</p>
              <p className="text-sm text-brand-300">Campagnes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - User selection */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-brand-700 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">YACRM</span>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                DEMO
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Choisissez un profil
            </h1>
            <p className="text-gray-500">
              Cliquez sur un utilisateur pour accéder au CRM avec ses données.
            </p>
          </div>

          <div className="space-y-3">
            {demoUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-surface-200 hover:border-brand-300 hover:bg-brand-50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand-700 text-white flex items-center justify-center font-bold text-sm">
                    {user.avatar}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 transition" />
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            Les données sont en mémoire et seront réinitialisées au rechargement.
          </p>
        </div>
      </div>
    </div>
  );
}
