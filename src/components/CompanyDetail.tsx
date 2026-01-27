import { useState } from 'react';
import { ArrowLeft, Pencil, Trash2, Building2, Mail, Phone, Globe, MapPin, FileText, Users, Sparkles, Save, X } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { AiUpsellModal } from './AiUpsellModal';

interface Props {
  companyId: string;
  onBack: () => void;
  onDelete: (id: string) => void;
}

export function CompanyDetail({ companyId, onBack, onDelete }: Props) {
  const { companies, contacts, updateCompany } = useData();
  const [showAiModal, setShowAiModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: '',
    notes: '',
  });

  const company = companies.find((c) => c.id === companyId);
  const companyContacts = contacts.filter((c) => c.company_id === companyId);

  const handleEdit = () => {
    if (company) {
      setFormData({
        name: company.name,
        industry: company.industry,
        website: company.website,
        phone: company.phone,
        email: company.email,
        address: company.address,
        city: company.city,
        country: company.country,
        notes: company.notes,
      });
      setIsEditing(true);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (company) {
      updateCompany(company.id, formData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Entreprise introuvable</p>
        <button onClick={onBack} className="mt-4 text-brand-600 hover:text-brand-700 font-medium transition-colors">
          Retour aux entreprises
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-surface-100 rounded-xl transition">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-brand-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-5.5 h-5.5 text-brand-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{company.name}</h2>
              {company.industry && (
                <p className="text-sm text-gray-500 mt-0.5">{company.industry}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <button onClick={handleEdit} className="btn-secondary">
                <Pencil className="w-4 h-4" />
                <span>Modifier</span>
              </button>
              <button onClick={() => onDelete(company.id)} className="btn-ghost text-red-600 hover:bg-red-50 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
                <span>Supprimer</span>
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        /* Mode Edition */
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Modifier l'entreprise</h3>
            <button
              onClick={() => setShowAiModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 font-medium rounded-xl hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Remplir avec l'IA
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l'entreprise *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Secteur d'activite</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Site web</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Telephone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pays</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="input-field"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
              <button type="button" onClick={handleCancel} className="btn-secondary">
                <X className="w-4 h-4" />
                <span>Annuler</span>
              </button>
              <button type="submit" className="btn-primary">
                <Save className="w-4 h-4" />
                <span>Enregistrer</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Mode Lecture */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Infos principales */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Informations</h3>
                <button
                  onClick={() => setShowAiModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Enrichir avec l'IA
                </button>
              </div>
              <div className="space-y-4">
                {company.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500">Email</p>
                      <a href={`mailto:${company.email}`} className="text-sm text-brand-600 hover:text-brand-700">
                        {company.email}
                      </a>
                    </div>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500">Telephone</p>
                      <a href={`tel:${company.phone}`} className="text-sm text-gray-900">
                        {company.phone}
                      </a>
                    </div>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500">Site web</p>
                      <a
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand-600 hover:text-brand-700"
                      >
                        {company.website}
                      </a>
                    </div>
                  </div>
                )}
                {(company.address || company.city || company.country) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-500">Adresse</p>
                      <p className="text-sm text-gray-900">
                        {[company.address, company.city, company.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}
                {!company.email && !company.phone && !company.website && !company.address && !company.city && (
                  <p className="text-sm text-gray-400 italic">Aucune information de contact</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Notes</h3>
              </div>
              {company.notes ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{company.notes}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">Aucune note</p>
              )}
            </div>

            {/* Metadata */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Historique</h3>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Cree le {new Date(company.created_at).toLocaleDateString('fr-FR')}</p>
                <p>Modifie le {new Date(company.updated_at).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div className="lg:col-span-2">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Contacts ({companyContacts.length})
                </h3>
              </div>

              {companyContacts.length === 0 ? (
                <p className="text-sm text-gray-400 italic py-4">Aucun contact associe a cette entreprise</p>
              ) : (
                <div className="overflow-x-auto -mx-5">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-surface-200">
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom</th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Poste</th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Telephone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companyContacts.map((contact) => (
                        <tr key={contact.id} className="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-bold text-emerald-700">
                                  {contact.first_name.charAt(0)}{contact.last_name.charAt(0)}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {contact.first_name} {contact.last_name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-5 text-sm text-gray-600">
                            {contact.email || '-'}
                          </td>
                          <td className="py-3 px-5 text-sm text-gray-600 hidden sm:table-cell">
                            {contact.job_title || '-'}
                          </td>
                          <td className="py-3 px-5 text-sm text-gray-600 hidden md:table-cell">
                            {contact.phone || '-'}
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
      )}

      <AiUpsellModal
        open={showAiModal}
        onClose={() => setShowAiModal(false)}
        feature="Enrichir automatiquement les donnees de l'entreprise (secteur, site web, telephone, email...) grace a l'intelligence artificielle"
      />
    </div>
  );
}
