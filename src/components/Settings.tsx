import { useState, useEffect } from 'react';
import { Mail, Check, AlertCircle, Eye, EyeOff, ExternalLink, Key, Plus, Trash2, Copy, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

interface ApiToken {
  id: string;
  name: string;
  last_used_at: string | null;
  created_at: string;
}

export function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [connected, setConnected] = useState(false);
  const [testing, setTesting] = useState(false);
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');

  // API Tokens state
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [newTokenName, setNewTokenName] = useState('');
  const [creatingToken, setCreatingToken] = useState(false);
  const [newTokenValue, setNewTokenValue] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    try {
      const rows = await api.get<ApiToken[]>('/tokens');
      setTokens(rows);
    } catch {
      // ignore
    }
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) return;
    setCreatingToken(true);
    try {
      const result = await api.post<{ id: string; name: string; value: string; created_at: string }>('/tokens', { name: newTokenName });
      setNewTokenValue(result.value);
      setNewTokenName('');
      await loadTokens();
    } finally {
      setCreatingToken(false);
    }
  };

  const handleDeleteToken = async (id: string) => {
    if (!confirm('Revoquer ce jeton ?')) return;
    await api.delete(`/tokens/${id}`);
    await loadTokens();
  };

  const handleCopyToken = async () => {
    if (newTokenValue) {
      await navigator.clipboard.writeText(newTokenValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setConnected(true);
    }, 1500);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setApiKey('');
    setFromEmail('');
    setFromName('');
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Parametres</h2>
        <p className="text-gray-500 mt-1">Configuration de votre compte</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* API Tokens */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Key className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Jetons API</h3>
              <p className="text-sm text-gray-500">Authentification pour les integrations externes</p>
            </div>
          </div>

          {/* New token value display */}
          {newTokenValue && (
            <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-800">Jeton cree avec succes</p>
              </div>
              <p className="text-xs text-emerald-600 mb-2">Copiez-le maintenant, il ne sera plus affiche.</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-white px-3 py-2 rounded-lg border border-emerald-200 font-mono break-all">
                  {newTokenValue}
                </code>
                <button
                  onClick={handleCopyToken}
                  className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition flex-shrink-0"
                  title="Copier"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={() => setNewTokenValue(null)}
                className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Fermer
              </button>
            </div>
          )}

          {/* Create token form */}
          <form onSubmit={handleCreateToken} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTokenName}
              onChange={(e) => setNewTokenName(e.target.value)}
              placeholder="Nom du jeton (ex: CI/CD, Zapier...)"
              className="input-field flex-1"
              required
            />
            <button type="submit" disabled={creatingToken || !newTokenName.trim()} className="btn-primary flex-shrink-0">
              <Plus className="w-4 h-4" />
              <span>Creer</span>
            </button>
          </form>

          {/* Token list */}
          {tokens.length === 0 ? (
            <p className="text-sm text-gray-400 italic py-2">Aucun jeton API</p>
          ) : (
            <div className="space-y-2">
              {tokens.map((token) => (
                <div key={token.id} className="flex items-center justify-between p-3 bg-surface-50 rounded-xl border border-surface-100">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{token.name}</p>
                    <p className="text-xs text-gray-400">
                      Cree le {new Date(token.created_at).toLocaleDateString('fr-FR')}
                      {token.last_used_at && ` · Utilise le ${new Date(token.last_used_at).toLocaleDateString('fr-FR')}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteToken(token.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Revoquer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email Provider */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-brand-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Fournisseur d'email</h3>
              <p className="text-sm text-gray-500">Connectez votre service d'envoi d'emails</p>
            </div>
            {connected && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                <Check className="w-3.5 h-3.5" />
                Connecte
              </span>
            )}
          </div>

          {/* Provider selector */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button className="flex items-center gap-3 p-3 border-2 border-brand-500 bg-brand-50 rounded-xl transition">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">R</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Resend</p>
                  <p className="text-[11px] text-gray-500">Recommande</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-3 border border-surface-200 rounded-xl opacity-50 cursor-not-allowed">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">SG</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">SendGrid</p>
                  <p className="text-[11px] text-gray-400">Bientot</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-3 border border-surface-200 rounded-xl opacity-50 cursor-not-allowed">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">M</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Mailgun</p>
                  <p className="text-[11px] text-gray-400">Bientot</p>
                </div>
              </button>
            </div>
          </div>

          {/* API Key form */}
          {!connected ? (
            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cle API Resend</label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="input-field pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <span>Trouvez votre cle sur</span>
                  <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 inline-flex items-center gap-0.5">
                    resend.com <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  Votre cle API est stockee localement dans votre navigateur. Elle n'est jamais envoyee a nos serveurs.
                </p>
              </div>

              <button
                type="submit"
                disabled={testing || !apiKey.trim()}
                className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Test de connexion...</span>
                  </>
                ) : (
                  <span>Connecter Resend</span>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-800">Connexion active</p>
                </div>
                <p className="text-xs text-emerald-600 ml-6">
                  Cle API : {apiKey.substring(0, 6)}...{apiKey.substring(apiKey.length - 4)}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email expediteur</label>
                  <input
                    type="email"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    placeholder="contact@mondomaine.com"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom expediteur</label>
                  <input
                    type="text"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder="Mon Entreprise"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button className="btn-primary flex-1 justify-center">
                  Enregistrer
                </button>
                <button onClick={handleDisconnect} className="btn-ghost text-red-600 hover:bg-red-50 hover:text-red-700">
                  Deconnecter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Domain info */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Configuration du domaine</h3>
          <p className="text-sm text-gray-500 mb-4">
            Pour envoyer des emails, vous devez verifier votre domaine dans Resend.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl border border-surface-100">
              <div>
                <p className="text-sm font-medium text-gray-700">Domaine verifie</p>
                <p className="text-xs text-gray-400">Configurez les enregistrements DNS sur Resend</p>
              </div>
              <span className="text-xs font-medium text-gray-400 bg-surface-200 px-2.5 py-1 rounded-full">Non configure</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl border border-surface-100">
              <div>
                <p className="text-sm font-medium text-gray-700">DKIM</p>
                <p className="text-xs text-gray-400">Authentification des emails</p>
              </div>
              <span className="text-xs font-medium text-gray-400 bg-surface-200 px-2.5 py-1 rounded-full">Non configure</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl border border-surface-100">
              <div>
                <p className="text-sm font-medium text-gray-700">SPF</p>
                <p className="text-xs text-gray-400">Protection anti-spam</p>
              </div>
              <span className="text-xs font-medium text-gray-400 bg-surface-200 px-2.5 py-1 rounded-full">Non configure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
