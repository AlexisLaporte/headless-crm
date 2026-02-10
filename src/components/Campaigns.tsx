import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Megaphone, Calendar, DollarSign, Users, Pencil, Trash2, X, CheckCircle2, Search, Sparkles } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { AiUpsellModal } from './AiUpsellModal';
import type { Campaign } from '../data/seed';

export function Campaigns() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    campaigns, allPeople,
    createCampaign, updateCampaign, deleteCampaign,
    getCampaignPersonIds, saveCampaignPeople,
  } = useData();

  const [showModal, setShowModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [selectedCampaignForContacts, setSelectedCampaignForContacts] = useState<Campaign | null>(null);
  const [campaignPeople, setCampaignPeople] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiFeature, setAiFeature] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'email',
    status: 'draft',
    start_date: '',
    end_date: '',
    budget: '0',
    description: '',
    subject: '',
    message_body: '',
  });

  // Handle edit-from-detail via location.state
  useEffect(() => {
    const state = location.state as { editCampaignId?: string } | null;
    if (state?.editCampaignId) {
      const campaign = campaigns.find((c) => c.id === state.editCampaignId);
      if (campaign) {
        handleEdit(campaign);
      }
      // Clear state so it doesn't re-trigger
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      budget: parseFloat(formData.budget) || 0,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    };
    if (editingId) {
      await updateCampaign(editingId, data);
    } else {
      await createCampaign(data);
    }
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette campagne ?')) return;
    await deleteCampaign(id);
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingId(campaign.id);
    setFormData({
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      start_date: campaign.start_date || '',
      end_date: campaign.end_date || '',
      budget: campaign.budget.toString(),
      description: campaign.description,
      subject: campaign.subject || '',
      message_body: campaign.message_body || '',
    });
    setShowModal(true);
  };

  const handleManageContacts = (campaign: Campaign) => {
    setSelectedCampaignForContacts(campaign);
    setCampaignPeople(getCampaignPersonIds(campaign.id));
    setShowContactsModal(true);
  };

  const handleSaveContacts = async () => {
    if (!selectedCampaignForContacts) return;
    await saveCampaignPeople(selectedCampaignForContacts.id, campaignPeople);
    setShowContactsModal(false);
    setSelectedCampaignForContacts(null);
    setCampaignPeople([]);
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'email', status: 'draft', start_date: '', end_date: '', budget: '0', description: '', subject: '', message_body: '' });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    resetForm();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700';
      case 'paused': return 'bg-amber-100 text-amber-700';
      case 'completed': return 'bg-brand-100 text-brand-700';
      default: return 'bg-surface-200 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'paused': return 'En pause';
      case 'completed': return 'Terminee';
      default: return 'Brouillon';
    }
  };

  const filtered = campaigns.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.type.toLowerCase().includes(search.toLowerCase())
  );

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campagnes</h2>
          <p className="text-gray-500 mt-1">{campaigns.length} campagne{campaigns.length > 1 ? 's' : ''} au total</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          <span>Nouvelle campagne</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card px-4 py-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{campaigns.length}</p>
        </div>
        <div className="card px-4 py-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Actives</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCampaigns}</p>
        </div>
        <div className="card px-4 py-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Budget total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalBudget.toLocaleString('fr-FR')} &euro;</p>
        </div>
        <div className="card px-4 py-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Terminees</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{campaigns.filter(c => c.status === 'completed').length}</p>
        </div>
      </div>

      {/* Search */}
      {campaigns.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-7 h-7 text-accent-700" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune campagne</h3>
          <p className="text-gray-500 mb-6">Commencez par creer votre premiere campagne</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            <span>Creer une campagne</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((campaign) => (
            <div
              key={campaign.id}
              onClick={() => navigate(`/app/campaigns/${campaign.id}`)}
              className="card p-5 cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-5 h-5 text-accent-700" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-brand-700 transition-colors">{campaign.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm text-gray-500 capitalize">{campaign.type}</span>
                      <span className={`badge ${getStatusColor(campaign.status)}`}>
                        {getStatusLabel(campaign.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(campaign); }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-surface-100 rounded-lg transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(campaign.id); }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {campaign.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{campaign.description}</p>
              )}

              <div className="space-y-1.5 pt-3 border-t border-surface-100">
                {(campaign.start_date || campaign.end_date) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      {campaign.start_date && new Date(campaign.start_date).toLocaleDateString('fr-FR')}
                      {campaign.start_date && campaign.end_date && ' - '}
                      {campaign.end_date && new Date(campaign.end_date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
                {campaign.budget > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                    <span>{campaign.budget.toLocaleString('fr-FR')} &euro;</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="w-3.5 h-3.5" />
                    <span>{campaign.campaign_people?.length || 0} personnes</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleManageContacts(campaign); }}
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
                  >
                    Gerer
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && search && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">Aucun resultat pour "{search}"</p>
            </div>
          )}
        </div>
      )}

      <AiUpsellModal open={showAiModal} onClose={() => setShowAiModal(false)} feature={aiFeature} />

      {/* Campaign Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="sticky top-0 bg-white border-b border-surface-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'Modifier la campagne' : 'Nouvelle campagne'}
              </h3>
              <button onClick={handleCloseModal} className="btn-ghost p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de la campagne *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="input-field" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="input-field">
                    <option value="email">Email</option>
                    <option value="social">Reseaux sociaux</option>
                    <option value="ads">Publicite</option>
                    <option value="event">Evenement</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Statut</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="input-field">
                    <option value="draft">Brouillon</option>
                    <option value="active">Active</option>
                    <option value="paused">En pause</option>
                    <option value="completed">Terminee</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de debut</label>
                  <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de fin</label>
                  <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget (&euro;)</label>
                <input type="number" step="0.01" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="input-field" />
              </div>
              <div className="border-t border-surface-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Message de la campagne</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-gray-700">Objet du message</label>
                      <button type="button" onClick={() => { setAiFeature('Generer automatiquement l\'objet du message de campagne'); setShowAiModal(true); }} className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors">
                        <Sparkles className="w-3 h-3" />
                        Generer avec l'IA
                      </button>
                    </div>
                    <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="Ex: Decouvrez notre nouvelle offre" className="input-field" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-gray-700">Corps du message</label>
                      <button type="button" onClick={() => { setAiFeature('Generer automatiquement le corps du message de campagne'); setShowAiModal(true); }} className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors">
                        <Sparkles className="w-3 h-3" />
                        Generer avec l'IA
                      </button>
                    </div>
                    <textarea value={formData.message_body} onChange={(e) => setFormData({ ...formData, message_body: e.target.value })} rows={8} placeholder="Redigez le contenu de votre message..." className="input-field" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">Annuler</button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Mettre a jour' : 'Creer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contacts Modal */}
      {showContactsModal && selectedCampaignForContacts && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="sticky top-0 bg-white border-b border-surface-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">
                Contacts - {selectedCampaignForContacts.name}
              </h3>
              <button
                onClick={() => { setShowContactsModal(false); setSelectedCampaignForContacts(null); setCampaignPeople([]); }}
                className="btn-ghost p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  Selectionnez les personnes a associer a cette campagne
                </p>
                <button
                  type="button"
                  onClick={() => { setAiFeature('Suggerer automatiquement les personnes les plus pertinentes pour cette campagne'); setShowAiModal(true); }}
                  className="inline-flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors whitespace-nowrap ml-4"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Suggerer des personnes
                </button>
              </div>

              <div className="space-y-1 max-h-96 overflow-y-auto">
                {allPeople.map((person) => (
                  <label
                    key={person.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={campaignPeople.includes(person.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCampaignPeople([...campaignPeople, person.id]);
                        } else {
                          setCampaignPeople(campaignPeople.filter((id) => id !== person.id));
                        }
                      }}
                      className="w-4 h-4 text-brand-600 rounded border-surface-300 focus:ring-2 focus:ring-brand-500/20"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">
                        {person.first_name} {person.last_name}
                      </p>
                      {person.email && (
                        <p className="text-xs text-gray-500 truncate">{person.email}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-surface-200 mt-6">
                <p className="text-sm text-gray-500">
                  {campaignPeople.length} personne{campaignPeople.length > 1 ? 's' : ''}{' '}
                  selectionnee{campaignPeople.length > 1 ? 's' : ''}
                </p>
                <button onClick={handleSaveContacts} className="btn-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
