import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'hcrm_pwa_dismissed';

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1');

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  if (!deferredPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 sm:w-96 z-50 animate-slide-up">
      <div className="bg-brand-950 text-white rounded-2xl shadow-xl p-4 flex items-start gap-3">
        <div className="w-10 h-10 bg-accent-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-brand-950" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Install Headless CRM</p>
          <p className="text-xs text-brand-300 mt-0.5">Add to your home screen for quick access</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 bg-accent-500 hover:bg-accent-400 text-brand-950 text-xs font-semibold rounded-lg transition"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-brand-300 hover:text-white text-xs font-medium rounded-lg transition"
            >
              Later
            </button>
          </div>
        </div>
        <button onClick={handleDismiss} className="p-1 hover:bg-white/10 rounded-lg transition flex-shrink-0">
          <X className="w-4 h-4 text-brand-300" />
        </button>
      </div>
    </div>
  );
}
