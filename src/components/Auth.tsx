import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, Code2, Zap, Shield, Globe } from 'lucide-react';

export function Auth() {
  const { signInGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogle = () => {
    setLoading(true);
    signInGoogle();
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
            <span className="text-xl font-bold text-white tracking-tight">Headless CRM</span>
          </div>

          {/* Center - Hero text */}
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 bg-accent-500/15 backdrop-blur-sm border border-accent-500/20 text-accent-300 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
              <Code2 className="w-3.5 h-3.5" />
              API-first contact management
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] mb-5">
              Your contact graph,<br />
              <span className="text-accent-400">API-first.</span>
            </h1>
            <p className="text-lg text-brand-200 leading-relaxed max-w-md">
              Manage people, organizations and deals through a REST API designed for AI agents and automations.
            </p>

            {/* Features grid */}
            <div className="grid grid-cols-3 gap-4 mt-10">
              <div className="bg-white/8 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <Code2 className="w-5 h-5 text-accent-400 mb-2" />
                <p className="text-sm font-semibold text-white">REST API</p>
                <p className="text-xs text-brand-300 mt-0.5">Token auth</p>
              </div>
              <div className="bg-white/8 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <Users className="w-5 h-5 text-accent-400 mb-2" />
                <p className="text-sm font-semibold text-white">People</p>
                <p className="text-xs text-brand-300 mt-0.5">Contact graph</p>
              </div>
              <div className="bg-white/8 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <Zap className="w-5 h-5 text-accent-400 mb-2" />
                <p className="text-sm font-semibold text-white">AI-ready</p>
                <p className="text-xs text-brand-300 mt-0.5">Agent-friendly</p>
              </div>
            </div>
          </div>

          {/* Bottom - Trust badges */}
          <div className="flex items-center gap-6 text-brand-300 text-sm">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              <span>Self-hosted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              <span>Open API</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>Agent-native</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Login */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile hero */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-brand-700 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Headless CRM</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
              Your contact graph, <span className="text-brand-600">API-first.</span>
            </h2>
            <p className="text-gray-500 text-sm">
              API-first contact management for AI agents.
            </p>
          </div>

          {/* Google login */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 p-3.5 rounded-xl border border-surface-200 hover:border-surface-300 hover:bg-surface-50 transition-all duration-200 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-medium text-gray-700">Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
