import { useAuth } from '../contexts/AuthContext';
import { demoUsers, DemoUser } from '../data/seed';
import { LayoutDashboard, ArrowRight, Building2, Users, Megaphone, Zap, Shield, Globe } from 'lucide-react';

export function Auth() {
  const { signIn } = useAuth();

  const handleSelect = (user: DemoUser) => {
    signIn(user);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Hero */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Background image */}
        <img
          src="/hero.jpg"
          alt="Equipe tech africaine"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/95 via-brand-950/80 to-brand-900/70" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top - Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-500 rounded-xl flex items-center justify-center shadow-lg">
              <LayoutDashboard className="w-5 h-5 text-brand-950" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">YACRM</span>
            <span className="bg-white/10 backdrop-blur text-white/80 text-[10px] font-bold px-2 py-0.5 rounded-md ml-1">DEMO</span>
          </div>

          {/* Center - Hero text */}
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 bg-accent-500/15 backdrop-blur-sm border border-accent-500/20 text-accent-300 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
              <Zap className="w-3.5 h-3.5" />
              Concu pour les PME africaines
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] mb-5">
              Vos relations clients,<br />
              <span className="text-accent-400">simplifiees.</span>
            </h1>
            <p className="text-lg text-brand-200 leading-relaxed max-w-md">
              Gerez vos entreprises, contacts et campagnes marketing depuis une interface pensee pour votre quotidien.
            </p>

            {/* Features grid */}
            <div className="grid grid-cols-3 gap-4 mt-10">
              <div className="bg-white/8 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <Building2 className="w-5 h-5 text-accent-400 mb-2" />
                <p className="text-sm font-semibold text-white">Entreprises</p>
                <p className="text-xs text-brand-300 mt-0.5">Fiches completes</p>
              </div>
              <div className="bg-white/8 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <Users className="w-5 h-5 text-accent-400 mb-2" />
                <p className="text-sm font-semibold text-white">Contacts</p>
                <p className="text-xs text-brand-300 mt-0.5">Lies aux entreprises</p>
              </div>
              <div className="bg-white/8 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <Megaphone className="w-5 h-5 text-accent-400 mb-2" />
                <p className="text-sm font-semibold text-white">Campagnes</p>
                <p className="text-xs text-brand-300 mt-0.5">Email & evenements</p>
              </div>
            </div>
          </div>

          {/* Bottom - Trust badges */}
          <div className="flex items-center gap-6 text-brand-300 text-sm">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              <span>Donnees securisees</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              <span>100% Cloud</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>Prise en main rapide</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - User selection */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile hero */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-brand-700 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">YACRM</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md">DEMO</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
              Vos relations clients, <span className="text-brand-600">simplifiees.</span>
            </h2>
            <p className="text-gray-500 text-sm">
              CRM concu pour les PME africaines.
            </p>
          </div>

          {/* Profile selection */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Choisissez un profil
            </h3>
            <p className="text-sm text-gray-500">
              Cliquez sur un utilisateur pour explorer le CRM avec ses donnees.
            </p>
          </div>

          <div className="space-y-2.5">
            {demoUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-surface-200 hover:border-brand-300 hover:bg-brand-50/50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {user.avatar}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-surface-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-600 transition-colors" />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-surface-200">
            <p className="text-xs text-gray-400 text-center">
              Mode demo — les donnees sont en memoire et reintialisees au rechargement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
