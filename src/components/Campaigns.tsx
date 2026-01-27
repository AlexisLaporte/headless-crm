import { useState, useEffect } from 'react';
import { Plus, Megaphone, Calendar, DollarSign, Users, Pencil, Trash2, X, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Campaign = Database['public']['Tables']['campaigns']['Row'];
type Contact = Database['public']['Tables']['contacts']['Row'];
type CampaignContact = Database['public']['Tables']['campaign_contacts']['Row'];

interface CampaignWithContacts extends Campaign {
  campaign_contacts?: CampaignContact[];
}

export function Campaigns() {
  const [campaigns, setCampaigns] = useState<CampaignWithContacts[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignContacts, setCampaignContacts] = useState<string[]>([]);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'email',
    status: 'draft',
    start_date: '',
    end_date: '',
    budget: '0',
    description: '',
  });

  useEffect(() => {
    loadCampaigns();
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .order('first_name');

    if (data) {
      setContacts(data);
    }
  };

  const loadCampaigns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, campaign_contacts(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading campaigns:', error);
    } else {
      setCampaigns(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSubmit = {
      ...formData,
      budget: parseFloat(formData.budget) || 0,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    };

    if (editingCampaign) {
      const { error } = await supabase
        .from('campaigns')
        .update({ ...dataToSubmit, updated_at: new Date().toISOString() })
        .eq('id', editingCampaign.id);

      if (error) {
        console.error('Error updating campaign:', error);
        return;
      }
    } else {
      const { error } = await supabase.from('campaigns').insert([dataToSubmit]);

      if (error) {
        console.error('Error creating campaign:', error);
        return;
      }
    }

    setShowModal(false);
    setEditingCampaign(null);
    resetForm();
    loadCampaigns();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) return;

    const { error } = await supabase.from('campaigns').delete().eq('id', id);

    if (error) {
      console.error('Error deleting campaign:', error);
    } else {
      loadCampaigns();
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      start_date: campaign.start_date || '',
      end_date: campaign.end_date || '',
      budget: campaign.budget.toString(),
      description: campaign.description,
    });
    setShowModal(true);
  };

  const handleManageContacts = async (campaign: Campaign) => {
    setSelectedCampaign(campaign);

    const { data } = await supabase
      .from('campaign_contacts')
      .select('contact_id')
      .eq('campaign_id', campaign.id);

    if (data) {
      setCampaignContacts(data.map((cc) => cc.contact_id));
    }

    setShowContactsModal(true);
  };

  const handleSaveContacts = async () => {
    if (!selectedCampaign) return;

    const { data: existing } = await supabase
      .from('campaign_contacts')
      .select('contact_id')
      .eq('campaign_id', selectedCampaign.id);

    const existingIds = existing?.map((cc) => cc.contact_id) || [];
    const toAdd = campaignContacts.filter((id) => !existingIds.includes(id));
    const toRemove = existingIds.filter((id) => !campaignContacts.includes(id));

    if (toAdd.length > 0) {
      await supabase.from('campaign_contacts').insert(
        toAdd.map((contact_id) => ({
          campaign_id: selectedCampaign.id,
          contact_id,
        }))
      );
    }

    if (toRemove.length > 0) {
      await supabase
        .from('campaign_contacts')
        .delete()
        .eq('campaign_id', selectedCampaign.id)
        .in('contact_id', toRemove);
    }

    setShowContactsModal(false);
    setSelectedCampaign(null);
    setCampaignContacts([]);
    loadCampaigns();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'email',
      status: 'draft',
      start_date: '',
      end_date: '',
      budget: '0',
      description: '',
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCampaign(null);
    resetForm();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'paused':
        return 'En pause';
      case 'completed':
        return 'Terminée';
      default:
        return 'Brouillon';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Campagnes</h2>
          <p className="text-slate-600 mt-1">Gérez vos campagnes marketing</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle campagne</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-blue-600"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Megaphone className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucune campagne</h3>
          <p className="text-slate-600 mb-6">Commencez par créer votre première campagne</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Plus className="w-5 h-5" />
            <span>Créer une campagne</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Megaphone className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{campaign.name}</h3>
                      <p className="text-sm text-slate-600 capitalize">{campaign.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        campaign.status
                      )}`}
                    >
                      {getStatusLabel(campaign.status)}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(campaign)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(campaign.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {campaign.description && (
                <p className="text-sm text-slate-600 mb-4">{campaign.description}</p>
              )}

              <div className="space-y-2">
                {(campaign.start_date || campaign.end_date) && (
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {campaign.start_date && new Date(campaign.start_date).toLocaleDateString('fr-FR')}
                      {campaign.start_date && campaign.end_date && ' - '}
                      {campaign.end_date && new Date(campaign.end_date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
                {campaign.budget > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <DollarSign className="w-4 h-4" />
                    <span>{campaign.budget.toLocaleString('fr-FR')} €</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Users className="w-4 h-4" />
                    <span>{campaign.campaign_contacts?.length || 0} contacts</span>
                  </div>
                  <button
                    onClick={() => handleManageContacts(campaign)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Gérer les contacts
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">
                {editingCampaign ? 'Modifier la campagne' : 'Nouvelle campagne'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom de la campagne *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="email">Email</option>
                    <option value="social">Réseaux sociaux</option>
                    <option value="ads">Publicité</option>
                    <option value="event">Événement</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Statut</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="draft">Brouillon</option>
                    <option value="active">Active</option>
                    <option value="paused">En pause</option>
                    <option value="completed">Terminée</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Budget (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  {editingCampaign ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showContactsModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">
                Contacts - {selectedCampaign.name}
              </h3>
              <button
                onClick={() => {
                  setShowContactsModal(false);
                  setSelectedCampaign(null);
                  setCampaignContacts([]);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Sélectionnez les contacts à associer à cette campagne
              </p>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {contacts.map((contact) => (
                  <label
                    key={contact.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={campaignContacts.includes(contact.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCampaignContacts([...campaignContacts, contact.id]);
                        } else {
                          setCampaignContacts(
                            campaignContacts.filter((id) => id !== contact.id)
                          );
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {contact.first_name} {contact.last_name}
                      </p>
                      {contact.email && (
                        <p className="text-sm text-slate-600">{contact.email}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-200 mt-6">
                <p className="text-sm text-slate-600">
                  {campaignContacts.length} contact{campaignContacts.length > 1 ? 's' : ''}{' '}
                  sélectionné{campaignContacts.length > 1 ? 's' : ''}
                </p>
                <button
                  onClick={handleSaveContacts}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  <CheckCircle2 className="w-5 h-5" />
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
