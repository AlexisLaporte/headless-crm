import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../lib/api';
import type { Organization, Person, Campaign, CampaignPerson } from '../data/seed';

// API returns people with organization_name from join
type ApiPerson = Person & { organization_name?: string | null };

// Enriched types for UI consumption
type EnrichedPerson = Person & { organization?: { name: string } | null };
type EnrichedCampaign = Campaign & { campaign_people?: CampaignPerson[] };

interface DataContextType {
  organizations: Organization[];
  people: EnrichedPerson[];
  campaigns: EnrichedCampaign[];
  allPeople: Person[];
  loadOrganizations: () => Promise<void>;
  loadPeople: () => Promise<void>;
  loadCampaigns: () => Promise<void>;
  createOrganization: (data: Omit<Organization, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateOrganization: (id: string, data: Partial<Organization>) => Promise<void>;
  deleteOrganization: (id: string) => Promise<void>;
  createPerson: (data: Omit<Person, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePerson: (id: string, data: Partial<Person>) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  createCampaign: (data: Omit<Campaign, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCampaign: (id: string, data: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  getCampaignPersonIds: (campaignId: string) => string[];
  saveCampaignPeople: (campaignId: string, personIds: string[]) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function toIsoString(d: Date | string | null | undefined): string {
  if (!d) return '';
  return typeof d === 'string' ? d : d.toISOString();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeOrganization(raw: any): Organization {
  return {
    id: raw.id,
    name: raw.name ?? '',
    industry: raw.industry ?? '',
    website: raw.website ?? '',
    phone: raw.phone ?? '',
    email: raw.email ?? '',
    address: raw.address ?? '',
    city: raw.city ?? '',
    country: raw.country ?? '',
    notes: raw.notes ?? '',
    user_id: raw.user_id,
    created_at: toIsoString(raw.created_at),
    updated_at: toIsoString(raw.updated_at),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePerson(raw: any): ApiPerson {
  return {
    id: raw.id,
    first_name: raw.first_name ?? '',
    last_name: raw.last_name ?? '',
    email: raw.email ?? '',
    phone: raw.phone ?? '',
    job_title: raw.job_title ?? '',
    notes: raw.notes ?? '',
    organization_id: raw.organization_id ?? null,
    user_id: raw.user_id,
    created_at: toIsoString(raw.created_at),
    updated_at: toIsoString(raw.updated_at),
    organization_name: raw.organization_name ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeCampaign(raw: any): EnrichedCampaign {
  return {
    id: raw.id,
    name: raw.name ?? '',
    type: raw.type ?? 'email',
    status: raw.status ?? 'draft',
    start_date: raw.start_date ?? null,
    end_date: raw.end_date ?? null,
    budget: Number(raw.budget) || 0,
    description: raw.description ?? '',
    subject: raw.subject ?? '',
    message_body: raw.message_body ?? '',
    user_id: raw.user_id,
    created_at: toIsoString(raw.created_at),
    updated_at: toIsoString(raw.updated_at),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    campaign_people: (raw.campaign_people || []).map((cp: any) => ({
      id: cp.id,
      campaign_id: cp.campaign_id,
      person_id: cp.person_id,
      status: cp.status ?? 'pending',
      created_at: toIsoString(cp.created_at),
    })),
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [rawPeople, setRawPeople] = useState<ApiPerson[]>([]);
  const [campaigns, setCampaigns] = useState<EnrichedCampaign[]>([]);

  const loadOrganizations = useCallback(async () => {
    const rows = await api.get<Record<string, unknown>[]>('/organizations');
    setOrganizations(rows.map(normalizeOrganization));
  }, []);

  const loadPeople = useCallback(async () => {
    const rows = await api.get<Record<string, unknown>[]>('/people');
    setRawPeople(rows.map(normalizePerson));
  }, []);

  const loadCampaigns = useCallback(async () => {
    const rows = await api.get<Record<string, unknown>[]>('/campaigns');
    setCampaigns(rows.map(normalizeCampaign));
  }, []);

  // Load all data on mount
  useEffect(() => {
    loadOrganizations();
    loadPeople();
    loadCampaigns();
  }, [loadOrganizations, loadPeople, loadCampaigns]);

  // Derived enriched people (add organization object for UI)
  const enrichedPeople: EnrichedPerson[] = rawPeople.map((p) => ({
    ...p,
    organization: p.organization_name ? { name: p.organization_name } : p.organization_id ? organizations.find((o) => o.id === p.organization_id) ? { name: organizations.find((o) => o.id === p.organization_id)!.name } : null : null,
  }));

  const allPeople: Person[] = [...rawPeople].sort((a, b) => a.first_name.localeCompare(b.first_name));

  // Organization CRUD
  const createOrganization = useCallback(async (data: Omit<Organization, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await api.post('/organizations', data);
    await loadOrganizations();
  }, [loadOrganizations]);

  const updateOrganization = useCallback(async (id: string, data: Partial<Organization>) => {
    await api.put(`/organizations/${id}`, data);
    await loadOrganizations();
  }, [loadOrganizations]);

  const deleteOrganization = useCallback(async (id: string) => {
    await api.delete(`/organizations/${id}`);
    await loadOrganizations();
    await loadPeople(); // people may have lost their organization_id
  }, [loadOrganizations, loadPeople]);

  // Person CRUD
  const createPerson = useCallback(async (data: Omit<Person, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await api.post('/people', data);
    await loadPeople();
  }, [loadPeople]);

  const updatePerson = useCallback(async (id: string, data: Partial<Person>) => {
    await api.put(`/people/${id}`, data);
    await loadPeople();
  }, [loadPeople]);

  const deletePerson = useCallback(async (id: string) => {
    await api.delete(`/people/${id}`);
    await loadPeople();
    await loadCampaigns(); // campaign_people cascade
  }, [loadPeople, loadCampaigns]);

  // Campaign CRUD
  const createCampaign = useCallback(async (data: Omit<Campaign, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await api.post('/campaigns', data);
    await loadCampaigns();
  }, [loadCampaigns]);

  const updateCampaign = useCallback(async (id: string, data: Partial<Campaign>) => {
    await api.put(`/campaigns/${id}`, data);
    await loadCampaigns();
  }, [loadCampaigns]);

  const deleteCampaign = useCallback(async (id: string) => {
    await api.delete(`/campaigns/${id}`);
    await loadCampaigns();
  }, [loadCampaigns]);

  // Campaign people
  const getCampaignPersonIds = useCallback((campaignId: string): string[] => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    return (campaign?.campaign_people || []).map((cp) => cp.person_id);
  }, [campaigns]);

  const saveCampaignPeople = useCallback(async (campaignId: string, personIds: string[]) => {
    await api.put(`/campaigns/${campaignId}/people`, { person_ids: personIds });
    await loadCampaigns();
  }, [loadCampaigns]);

  return (
    <DataContext.Provider
      value={{
        organizations,
        people: enrichedPeople,
        campaigns,
        allPeople,
        loadOrganizations,
        loadPeople,
        loadCampaigns,
        createOrganization,
        updateOrganization,
        deleteOrganization,
        createPerson,
        updatePerson,
        deletePerson,
        createCampaign,
        updateCampaign,
        deleteCampaign,
        getCampaignPersonIds,
        saveCampaignPeople,
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
