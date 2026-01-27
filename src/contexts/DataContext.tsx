import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Company, Contact, Campaign, CampaignContact,
  seedCompanies, seedContacts, seedCampaigns, seedCampaignContacts,
} from '../data/seed';

interface DataContextType {
  companies: Company[];
  contacts: (Contact & { companies?: Company | null })[];
  campaigns: (Campaign & { campaign_contacts?: CampaignContact[] })[];
  allContacts: Contact[];
  loadCompanies: () => void;
  loadContacts: () => void;
  loadCampaigns: () => void;
  createCompany: (data: Omit<Company, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updateCompany: (id: string, data: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  createContact: (data: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updateContact: (id: string, data: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  createCampaign: (data: Omit<Campaign, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updateCampaign: (id: string, data: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  getCampaignContactIds: (campaignId: string) => string[];
  saveCampaignContacts: (campaignId: string, contactIds: string[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

let nextId = 100;
const genId = () => `gen-${nextId++}`;

export function DataProvider({ children, userId }: { children: ReactNode; userId: string }) {
  const [companies, setCompanies] = useState<Company[]>([...seedCompanies]);
  const [contacts, setContacts] = useState<Contact[]>([...seedContacts]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([...seedCampaigns]);
  const [campaignContacts, setCampaignContacts] = useState<CampaignContact[]>([...seedCampaignContacts]);

  const enrichedContacts = contacts
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((c) => ({
      ...c,
      companies: c.company_id ? companies.find((co) => co.id === c.company_id) ?? null : null,
    }));

  const enrichedCampaigns = campaigns
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((c) => ({
      ...c,
      campaign_contacts: campaignContacts.filter((cc) => cc.campaign_id === c.id),
    }));

  const sortedCompanies = [...companies].sort((a, b) => b.created_at.localeCompare(a.created_at));

  const allContacts = [...contacts].sort((a, b) => a.first_name.localeCompare(b.first_name));

  const loadCompanies = useCallback(() => {}, []);
  const loadContacts = useCallback(() => {}, []);
  const loadCampaigns = useCallback(() => {}, []);

  const createCompany = useCallback((data: Omit<Company, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    setCompanies((prev) => [...prev, { ...data, id: genId(), user_id: userId, created_at: now, updated_at: now }]);
  }, [userId]);

  const updateCompany = useCallback((id: string, data: Partial<Company>) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c))
    );
  }, []);

  const deleteCompany = useCallback((id: string) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const createContact = useCallback((data: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    setContacts((prev) => [...prev, { ...data, id: genId(), user_id: userId, created_at: now, updated_at: now }]);
  }, [userId]);

  const updateContact = useCallback((id: string, data: Partial<Contact>) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c))
    );
  }, []);

  const deleteContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setCampaignContacts((prev) => prev.filter((cc) => cc.contact_id !== id));
  }, []);

  const createCampaign = useCallback((data: Omit<Campaign, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    setCampaigns((prev) => [...prev, { ...data, id: genId(), user_id: userId, created_at: now, updated_at: now }]);
  }, [userId]);

  const updateCampaign = useCallback((id: string, data: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c))
    );
  }, []);

  const deleteCampaign = useCallback((id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    setCampaignContacts((prev) => prev.filter((cc) => cc.campaign_id !== id));
  }, []);

  const getCampaignContactIds = useCallback((campaignId: string) => {
    return campaignContacts.filter((cc) => cc.campaign_id === campaignId).map((cc) => cc.contact_id);
  }, [campaignContacts]);

  const saveCampaignContacts = useCallback((campaignId: string, contactIds: string[]) => {
    setCampaignContacts((prev) => {
      const without = prev.filter((cc) => cc.campaign_id !== campaignId);
      const newEntries: CampaignContact[] = contactIds.map((contactId) => ({
        id: genId(),
        campaign_id: campaignId,
        contact_id: contactId,
        status: 'pending',
        created_at: new Date().toISOString(),
      }));
      return [...without, ...newEntries];
    });
  }, []);

  return (
    <DataContext.Provider
      value={{
        companies: sortedCompanies,
        contacts: enrichedContacts,
        campaigns: enrichedCampaigns,
        allContacts,
        loadCompanies,
        loadContacts,
        loadCampaigns,
        createCompany,
        updateCompany,
        deleteCompany,
        createContact,
        updateContact,
        deleteContact,
        createCampaign,
        updateCampaign,
        deleteCampaign,
        getCampaignContactIds,
        saveCampaignContacts,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
