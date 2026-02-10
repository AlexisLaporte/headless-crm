import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, Mail, Phone, Globe, MapPin, Pencil, Trash2, X, Search, Sparkles } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { AiUpsellModal } from './AiUpsellModal';

export function Organizations() {
  const navigate = useNavigate();
  const { organizations, createOrganization, updateOrganization, deleteOrganization } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateOrganization(editingId, formData);
    } else {
      await createOrganization(formData);
    }
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette organisation ?')) return;
    await deleteOrganization(id);
  };

  const handleEdit = (org: typeof organizations[0]) => {
    setEditingId(org.id);
    setFormData({
      name: org.name,
      industry: org.industry,
      website: org.website,
      phone: org.phone,
      email: org.email,
      address: org.address,
      city: org.city,
      country: org.country,
      notes: org.notes,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', industry: '', website: '', phone: '', email: '', address: '', city: '', country: '', notes: '' });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    resetForm();
  };

  const filtered = organizations.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.industry.toLowerCase().includes(search.toLowerCase()) ||
    o.city.toLowerCase().includes(search.toLowerCase())
  );

  const industries = [...new Set(organizations.map(o => o.industry).filter(Boolean))];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Organisations</h2>
          <p className="text-gray-500 mt-1">{organizations.length} organisation{organizations.length > 1 ? 's' : ''} au total</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          <span>Nouvelle organisation</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card px-4 py-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{organizations.length}</p>
        </div>
        <div className="card px-4 py-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Secteurs</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{industries.length}</p>
        </div>
        <div className="card px-4 py-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Villes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{[...new Set(organizations.map(o => o.city).filter(Boolean))].length}</p>
        </div>
        <div className="card px-4 py-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avec email</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{organizations.filter(o => o.email).length}</p>
        </div>
      </div>

      {/* Search */}
      {organizations.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, secteur, ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      )}

      {organizations.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-7 h-7 text-brand-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune organisation</h3>
          <p className="text-gray-500 mb-6">Commencez par ajouter votre premiere organisation</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            <span>Ajouter une organisation</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((org) => (
            <div key={org.id} className="card p-5 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <button
                  onClick={() => navigate(`/app/organizations/${org.id}`)}
                  className="flex items-center gap-3 min-w-0 text-left hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{org.name}</h3>
                    {org.industry && (
                      <p className="text-sm text-gray-500 truncate">{org.industry}</p>
                    )}
                  </div>
                </button>
                <div className="flex gap-0.5 flex-shrink-0">
                  <button onClick={() => navigate(`/app/organizations/${org.id}`)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition" title="Voir la fiche">
                    <Building2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setShowAiModal(true)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition" title="Enrichir avec l'IA">
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleEdit(org)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-surface-100 rounded-lg transition" title="Modifier">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(org.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Supprimer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-surface-100">
                {org.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{org.email}</span>
                  </div>
                )}
                {org.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>{org.phone}</span>
                  </div>
                )}
                {org.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{org.website}</span>
                  </div>
                )}
                {(org.city || org.country) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>{[org.city, org.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
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

      <AiUpsellModal open={showAiModal} onClose={() => setShowAiModal(false)} feature="Enrichir automatiquement les donnees de l'organisation (secteur, site web, telephone, email...)" />

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="sticky top-0 bg-white border-b border-surface-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? "Modifier l'organisation" : 'Nouvelle organisation'}
              </h3>
              <button onClick={handleCloseModal} className="btn-ghost p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l'organisation *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="input-field" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Secteur d'activite</label>
                  <input type="text" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Site web</label>
                  <input type="text" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Telephone</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville</label>
                  <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Pays</label>
                  <input type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="input-field" />
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
    </div>
  );
}
