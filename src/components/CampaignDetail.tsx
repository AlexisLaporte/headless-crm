import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Megaphone, Calendar, DollarSign, Mail, Users, Sparkles } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { AiUpsellModal } from './AiUpsellModal';

export function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiFeature, setAiFeature] = useState('');
  const { campaigns, allContacts, deleteCampaign } = useData();

  const campaign = campaigns.find((c) => c.id === id);
  const campaignContactEntries = campaign?.campaign_contacts || [];

  const contactsWithStatus = campaignContactEntries.map((cc) => {
    const contact = allContacts.find((c) => c.id === cc.contact_id);
    return { ...cc, contact };
  });

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

  const getContactStatusLabel = (status: string) => {
    switch (status) {
      case 'sent': return 'Envoye';
      case 'opened': return 'Ouvert';
      case 'clicked': return 'Clique';
      case 'responded': return 'Repondu';
      default: return 'En attente';
    }
  };

  const getContactStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'opened': return 'bg-emerald-100 text-emerald-700';
      case 'clicked': return 'bg-purple-100 text-purple-700';
      case 'responded': return 'bg-teal-100 text-teal-700';
      default: return 'bg-surface-200 text-gray-600';
    }
  };

  const handleEdit = () => {
    if (campaign) {
      navigate('/app/campaigns', { state: { editCampaignId: campaign.id } });
    }
  };

  const handleDelete = () => {
    if (!campaign) return;
    if (!confirm('Supprimer cette campagne ?')) return;
    deleteCampaign(campaign.id);
    navigate('/app/campaigns');
  };

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Campagne introuvable</p>
        <button onClick={() => navigate('/app/campaigns')} className="mt-4 text-brand-600 hover:text-brand-700 font-medium transition-colors">
          Retour aux campagnes
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/app/campaigns')} className="p-2 hover:bg-surface-100 rounded-xl transition">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-accent-100 rounded-xl flex items-center justify-center">
              <Megaphone className="w-5.5 h-5.5 text-accent-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{campaign.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-gray-500 capitalize">{campaign.type}</span>
                <span className={`badge ${getStatusColor(campaign.status)}`}>
                  {getStatusLabel(campaign.status)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleEdit} className="btn-secondary">
            <Pencil className="w-4 h-4" />
            <span>Modifier</span>
          </button>
          <button onClick={handleDelete} className="btn-ghost text-red-600 hover:bg-red-50 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
            <span>Supprimer</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Infos */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Informations</h3>
            <div className="space-y-4">
              {(campaign.start_date || campaign.end_date) && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Dates</p>
                    <p className="text-sm text-gray-900">
                      {campaign.start_date && new Date(campaign.start_date).toLocaleDateString('fr-FR')}
                      {campaign.start_date && campaign.end_date && ' - '}
                      {campaign.end_date && new Date(campaign.end_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              )}
              {campaign.budget > 0 && (
                <div className="flex items-start gap-3">
                  <DollarSign className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Budget</p>
                    <p className="text-sm text-gray-900 font-medium">{campaign.budget.toLocaleString('fr-FR')} &euro;</p>
                  </div>
                </div>
              )}
              {campaign.description && (
                <div className="pt-3 border-t border-surface-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{campaign.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Message</h3>
            </div>
            {campaign.subject || campaign.message_body ? (
              <div className="space-y-3">
                {campaign.subject && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Objet</p>
                    <p className="text-sm text-gray-900 font-medium">{campaign.subject}</p>
                  </div>
                )}
                {campaign.message_body && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Corps du message</p>
                    <div className="bg-surface-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border border-surface-100">
                      {campaign.message_body}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => { setAiFeature('Ameliorer le message de la campagne avec l\'IA'); setShowAiModal(true); }}
                  className="inline-flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors mt-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Ameliorer avec l'IA
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-400 italic mb-3">Aucun message redige</p>
                <button
                  onClick={() => { setAiFeature('Rediger automatiquement le message de la campagne'); setShowAiModal(true); }}
                  className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Rediger avec l'IA
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contacts */}
        <div className="lg:col-span-2">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Contacts ({contactsWithStatus.length})
              </h3>
            </div>

            {contactsWithStatus.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-4">Aucun contact associe a cette campagne</p>
            ) : (
              <div className="overflow-x-auto -mx-5">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-200">
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Poste</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contactsWithStatus.map((cc) => (
                      <tr key={cc.id} className="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-emerald-700">
                                {cc.contact ? `${cc.contact.first_name.charAt(0)}${cc.contact.last_name.charAt(0)}` : '?'}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {cc.contact ? `${cc.contact.first_name} ${cc.contact.last_name}` : '-'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-5 text-sm text-gray-600">
                          {cc.contact?.email || '-'}
                        </td>
                        <td className="py-3 px-5 text-sm text-gray-600 hidden sm:table-cell">
                          {cc.contact?.job_title || '-'}
                        </td>
                        <td className="py-3 px-5">
                          <span className={`badge ${getContactStatusColor(cc.status)}`}>
                            {getContactStatusLabel(cc.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <AiUpsellModal open={showAiModal} onClose={() => setShowAiModal(false)} feature={aiFeature} />
    </div>
  );
}
