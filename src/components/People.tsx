import { useState } from 'react';
import { Plus, User, Mail, Phone, Building2, Pencil, Trash2, X, Search, Sparkles } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { AiUpsellModal } from './AiUpsellModal';

export function People() {
  const { people, organizations, createPerson, updatePerson, deletePerson } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    organization_id: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData, organization_id: formData.organization_id || null };
    if (editingId) {
      await updatePerson(editingId, data);
    } else {
      await createPerson(data);
    }
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette personne ?')) return;
    await deletePerson(id);
  };

  const handleEdit = (person: typeof people[0]) => {
    setEditingId(person.id);
    setFormData({
      first_name: person.first_name,
      last_name: person.last_name,
      email: person.email,
      phone: person.phone,
      job_title: person.job_title,
      organization_id: person.organization_id || '',
      notes: person.notes,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ first_name: '', last_name: '', email: '', phone: '', job_title: '', organization_id: '', notes: '' });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    resetForm();
  };

  const filtered = people.filter((p) =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.job_title.toLowerCase().includes(search.toLowerCase())
  );

  const withOrg = people.filter(p => p.organization_id).length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Personnes</h2>
          <p className="text-gray-500 mt-1">{people.length} personne{people.length > 1 ? 's' : ''} au total</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          <span>Nouvelle personne</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card px-4 py-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{people.length}</p>
        </div>
        <div className="card px-4 py-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avec organisation</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{withOrg}</p>
        </div>
        <div className="card px-4 py-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Independants</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{people.length - withOrg}</p>
        </div>
        <div className="card px-4 py-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avec email</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{people.filter(p => p.email).length}</p>
        </div>
      </div>

      {/* Search */}
      {people.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, fonction..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      )}

      {people.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-7 h-7 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune personne</h3>
          <p className="text-gray-500 mb-6">Commencez par ajouter votre premiere personne</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            <span>Ajouter une personne</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((person) => (
            <div key={person.id} className="card p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-emerald-700">
                      {person.first_name.charAt(0)}{person.last_name.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {person.first_name} {person.last_name}
                    </h3>
                    {person.job_title && (
                      <p className="text-sm text-gray-500 truncate">{person.job_title}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-0.5 flex-shrink-0">
                  <button onClick={() => setShowAiModal(true)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition" title="Enrichir avec l'IA">
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleEdit(person)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-surface-100 rounded-lg transition">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(person.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-surface-100">
                {person.organization && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{person.organization.name}</span>
                  </div>
                )}
                {person.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{person.email}</span>
                  </div>
                )}
                {person.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>{person.phone}</span>
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

      <AiUpsellModal open={showAiModal} onClose={() => setShowAiModal(false)} feature="Enrichir le profil de la personne (trouver l'email, le telephone, le profil LinkedIn...)" />

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="sticky top-0 bg-white border-b border-surface-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'Modifier la personne' : 'Nouvelle personne'}
              </h3>
              <button onClick={handleCloseModal} className="btn-ghost p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Prenom *</label>
                  <input type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label>
                  <input type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Organisation</label>
                <select value={formData.organization_id} onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })} className="input-field">
                  <option value="">Aucune organisation</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fonction</label>
                <input type="text" value={formData.job_title} onChange={(e) => setFormData({ ...formData, job_title: e.target.value })} className="input-field" />
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
