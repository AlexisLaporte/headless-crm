export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  notes: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: string;
  organization_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  job_title: string;
  notes: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  budget: number;
  description: string;
  subject: string;
  message_body: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignPerson {
  id: string;
  campaign_id: string;
  person_id: string;
  status: string;
  created_at: string;
}

export type DealStage = 'draft' | 'sent' | 'negotiation' | 'won' | 'lost';
export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'linkedin_message' | 'stage_change' | 'deal_created' | 'deal_won' | 'deal_lost' | 'other';
export type TaskStatus = 'pending' | 'done' | 'cancelled';
export type TaskType = 'follow_up' | 'call' | 'email' | 'meeting' | 'other';

export interface Deal {
  id: string;
  title: string;
  stage: DealStage;
  amount: number | null;
  closed_reason: string | null;
  person_id: string | null;
  organization_id: string | null;
  user_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  content: string | null;
  channel: string | null;
  deal_id: string | null;
  person_id: string | null;
  changes: Record<string, unknown> | null;
  user_id: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  type: TaskType;
  status: TaskStatus;
  due_date: string | null;
  remind_at: string | null;
  deal_id: string | null;
  person_id: string | null;
  user_id: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const demoUsers: DemoUser[] = [
  {
    id: 'user-1',
    name: 'Marie Dupont',
    email: 'marie.dupont@techvision.fr',
    role: 'Directrice Commerciale',
    avatar: 'MD',
  },
  {
    id: 'user-2',
    name: 'Thomas Martin',
    email: 'thomas.martin@techvision.fr',
    role: 'Responsable Marketing',
    avatar: 'TM',
  },
  {
    id: 'user-3',
    name: 'Sophie Bernard',
    email: 'sophie.bernard@techvision.fr',
    role: 'Account Manager',
    avatar: 'SB',
  },
];

export const seedOrganizations: Organization[] = [
  {
    id: 'org-1',
    name: 'TechVision SAS',
    industry: 'Technologies',
    website: 'https://techvision.fr',
    phone: '+33 1 42 68 53 00',
    email: 'contact@techvision.fr',
    address: '15 rue de la Paix',
    city: 'Paris',
    country: 'France',
    notes: 'Client historique, renouvellement contrat Q2 2026',
    user_id: 'user-1',
    created_at: '2025-09-15T10:00:00Z',
    updated_at: '2026-01-10T14:30:00Z',
  },
  {
    id: 'org-2',
    name: 'BioNature Labs',
    industry: 'Santé / Biotech',
    website: 'https://bionature-labs.com',
    phone: '+33 4 72 33 21 00',
    email: 'info@bionature-labs.com',
    address: '8 avenue Lacassagne',
    city: 'Lyon',
    country: 'France',
    notes: 'Prospect chaud, intéressé par notre offre Enterprise',
    user_id: 'user-1',
    created_at: '2025-11-20T09:00:00Z',
    updated_at: '2026-01-15T11:00:00Z',
  },
  {
    id: 'org-3',
    name: 'UrbanDesign Studio',
    industry: 'Architecture / Design',
    website: 'https://urbandesign.studio',
    phone: '+33 5 56 44 12 00',
    email: 'hello@urbandesign.studio',
    address: '22 cours de l\'Intendance',
    city: 'Bordeaux',
    country: 'France',
    notes: 'Partenaire agence, apporteur d\'affaires régulier',
    user_id: 'user-1',
    created_at: '2025-10-05T08:00:00Z',
    updated_at: '2025-12-20T16:00:00Z',
  },
  {
    id: 'org-4',
    name: 'DataFlow AI',
    industry: 'Data / Intelligence Artificielle',
    website: 'https://dataflow-ai.com',
    phone: '+33 5 61 22 33 44',
    email: 'contact@dataflow-ai.com',
    address: '3 impasse Barbet',
    city: 'Toulouse',
    country: 'France',
    notes: 'Startup en forte croissance, levée de fonds récente',
    user_id: 'user-2',
    created_at: '2025-12-01T10:00:00Z',
    updated_at: '2026-01-20T09:00:00Z',
  },
  {
    id: 'org-5',
    name: 'GreenEnergy Solutions',
    industry: 'Énergie renouvelable',
    website: 'https://greenenergy-solutions.fr',
    phone: '+33 2 40 55 66 77',
    email: 'commercial@greenenergy-solutions.fr',
    address: '12 boulevard de la Prairie',
    city: 'Nantes',
    country: 'France',
    notes: 'Grand compte, 3 projets en cours',
    user_id: 'user-2',
    created_at: '2025-08-10T14:00:00Z',
    updated_at: '2026-01-05T10:00:00Z',
  },
  {
    id: 'org-6',
    name: 'MediaPulse Agency',
    industry: 'Média / Communication',
    website: 'https://mediapulse.agency',
    phone: '+33 4 91 33 44 55',
    email: 'bonjour@mediapulse.agency',
    address: '45 rue Paradis',
    city: 'Marseille',
    country: 'France',
    notes: 'Nouveau client depuis novembre, phase d\'onboarding',
    user_id: 'user-3',
    created_at: '2025-11-01T11:00:00Z',
    updated_at: '2026-01-12T15:00:00Z',
  },
  {
    id: 'org-7',
    name: 'LogiTrans Europe',
    industry: 'Logistique / Transport',
    website: 'https://logitrans.eu',
    phone: '+33 3 88 22 11 00',
    email: 'info@logitrans.eu',
    address: '7 rue du Fossé des Treize',
    city: 'Strasbourg',
    country: 'France',
    notes: 'Contrat cadre signé, déploiement en cours sur 5 sites',
    user_id: 'user-3',
    created_at: '2025-07-20T09:00:00Z',
    updated_at: '2025-12-15T14:00:00Z',
  },
  {
    id: 'org-8',
    name: 'EduSmart',
    industry: 'EdTech / Formation',
    website: 'https://edusmart.io',
    phone: '+33 1 55 66 77 88',
    email: 'partenariats@edusmart.io',
    address: '30 rue des Petits Champs',
    city: 'Paris',
    country: 'France',
    notes: 'Prospect qualifié, démo planifiée pour février',
    user_id: 'user-1',
    created_at: '2026-01-08T10:00:00Z',
    updated_at: '2026-01-25T09:00:00Z',
  },
];

export const seedPeople: Person[] = [
  { id: 'pers-1', organization_id: 'org-1', first_name: 'Jean-Pierre', last_name: 'Moreau', email: 'jp.moreau@techvision.fr', phone: '+33 6 12 34 56 78', job_title: 'CEO', notes: 'Décideur principal, préfère les appels le matin', user_id: 'user-1', created_at: '2025-09-15T10:30:00Z', updated_at: '2026-01-10T14:30:00Z' },
  { id: 'pers-2', organization_id: 'org-1', first_name: 'Claire', last_name: 'Fontaine', email: 'c.fontaine@techvision.fr', phone: '+33 6 23 45 67 89', job_title: 'Directrice Technique', notes: 'Contact technique pour les intégrations API', user_id: 'user-1', created_at: '2025-09-20T11:00:00Z', updated_at: '2025-12-05T09:00:00Z' },
  { id: 'pers-3', organization_id: 'org-2', first_name: 'Luc', last_name: 'Renard', email: 'l.renard@bionature-labs.com', phone: '+33 6 34 56 78 90', job_title: 'Directeur R&D', notes: 'Très intéressé par les fonctionnalités analytics', user_id: 'user-1', created_at: '2025-11-20T09:30:00Z', updated_at: '2026-01-15T11:00:00Z' },
  { id: 'pers-4', organization_id: 'org-2', first_name: 'Isabelle', last_name: 'Petit', email: 'i.petit@bionature-labs.com', phone: '+33 6 45 67 89 01', job_title: 'Responsable Achats', notes: 'Gère le budget IT, contact pour la facturation', user_id: 'user-1', created_at: '2025-12-02T14:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'pers-5', organization_id: 'org-3', first_name: 'Antoine', last_name: 'Leroy', email: 'antoine@urbandesign.studio', phone: '+33 6 56 78 90 12', job_title: 'Fondateur & Architecte', notes: 'Contact principal, nous recommande à ses clients', user_id: 'user-1', created_at: '2025-10-05T08:30:00Z', updated_at: '2025-12-20T16:00:00Z' },
  { id: 'pers-6', organization_id: 'org-4', first_name: 'Nadia', last_name: 'Cheng', email: 'nadia.cheng@dataflow-ai.com', phone: '+33 6 67 89 01 23', job_title: 'CTO', notes: 'Background ML, cherche une solution scalable', user_id: 'user-2', created_at: '2025-12-01T10:30:00Z', updated_at: '2026-01-20T09:00:00Z' },
  { id: 'pers-7', organization_id: 'org-4', first_name: 'Hugo', last_name: 'Blanc', email: 'hugo.blanc@dataflow-ai.com', phone: '+33 6 78 90 12 34', job_title: 'Head of Sales', notes: 'Contact commercial, très réactif par email', user_id: 'user-2', created_at: '2025-12-15T09:00:00Z', updated_at: '2026-01-18T11:00:00Z' },
  { id: 'pers-8', organization_id: 'org-5', first_name: 'Émilie', last_name: 'Garnier', email: 'e.garnier@greenenergy-solutions.fr', phone: '+33 6 89 01 23 45', job_title: 'Directrice Générale', notes: 'Décideuse finale, très orientée ROI', user_id: 'user-2', created_at: '2025-08-10T14:30:00Z', updated_at: '2026-01-05T10:00:00Z' },
  { id: 'pers-9', organization_id: 'org-5', first_name: 'Marc', last_name: 'Dubois', email: 'm.dubois@greenenergy-solutions.fr', phone: '+33 6 90 12 34 56', job_title: 'Responsable IT', notes: 'Gère les 3 projets en cours, point de contact opérationnel', user_id: 'user-2', created_at: '2025-09-01T10:00:00Z', updated_at: '2025-12-28T15:00:00Z' },
  { id: 'pers-10', organization_id: 'org-6', first_name: 'Camille', last_name: 'Roche', email: 'camille@mediapulse.agency', phone: '+33 6 01 23 45 67', job_title: 'Directrice de Création', notes: 'Premier contact, très enthousiaste sur le produit', user_id: 'user-3', created_at: '2025-11-01T11:30:00Z', updated_at: '2026-01-12T15:00:00Z' },
  { id: 'pers-11', organization_id: 'org-7', first_name: 'Philippe', last_name: 'Weber', email: 'p.weber@logitrans.eu', phone: '+33 6 11 22 33 44', job_title: 'Directeur des Opérations', notes: 'Supervise le déploiement multi-sites', user_id: 'user-3', created_at: '2025-07-20T09:30:00Z', updated_at: '2025-12-15T14:00:00Z' },
  { id: 'pers-12', organization_id: 'org-7', first_name: 'Anna', last_name: 'Schmidt', email: 'a.schmidt@logitrans.eu', phone: '+33 6 22 33 44 55', job_title: 'Chef de Projet Digital', notes: 'Contact quotidien pour le suivi du déploiement', user_id: 'user-3', created_at: '2025-08-05T10:00:00Z', updated_at: '2025-12-10T11:00:00Z' },
  { id: 'pers-13', organization_id: 'org-8', first_name: 'Julien', last_name: 'Faure', email: 'j.faure@edusmart.io', phone: '+33 6 33 44 55 66', job_title: 'CEO & Co-fondateur', notes: 'Prospect chaud, démo prévue début février', user_id: 'user-1', created_at: '2026-01-08T10:30:00Z', updated_at: '2026-01-25T09:00:00Z' },
  { id: 'pers-14', organization_id: null, first_name: 'Vincent', last_name: 'Lemaire', email: 'vincent.lemaire@gmail.com', phone: '+33 6 44 55 66 77', job_title: 'Consultant indépendant', notes: 'Freelance, potentiel prescripteur', user_id: 'user-2', created_at: '2025-10-15T13:00:00Z', updated_at: '2025-11-20T10:00:00Z' },
];

export const seedCampaigns: Campaign[] = [
  { id: 'camp-1', name: 'Lancement Offre Enterprise Q1 2026', type: 'email', status: 'active', start_date: '2026-01-15', end_date: '2026-03-31', budget: 5000, description: 'Campagne email ciblée pour promouvoir la nouvelle offre Enterprise auprès des prospects qualifiés et clients existants.', subject: 'Découvrez notre nouvelle offre Enterprise', message_body: 'Bonjour,\n\nNous avons le plaisir de vous présenter notre nouvelle offre Enterprise, conçue pour répondre aux besoins des organisations en croissance.\n\nPoints clés :\n- Accès illimité à toutes les fonctionnalités\n- Support dédié 24/7\n- Intégrations personnalisées\n\nN\'hésitez pas à nous contacter pour une démonstration.\n\nCordialement,\nL\'équipe Headless CRM', user_id: 'user-1', created_at: '2026-01-10T09:00:00Z', updated_at: '2026-01-20T14:00:00Z' },
  { id: 'camp-2', name: 'Webinar IA & Data - Février', type: 'event', status: 'draft', start_date: '2026-02-20', end_date: '2026-02-20', budget: 2000, description: 'Webinar co-organisé avec DataFlow AI sur les tendances IA 2026. Objectif : 150 inscrits.', subject: 'Invitation : Webinar IA & Data - 20 février 2026', message_body: 'Bonjour,\n\nNous vous invitons à notre webinar exclusif sur les tendances IA & Data en 2026.\n\nDate : 20 février 2026 à 14h00\nDurée : 1h30\nIntervenants : Nadia Cheng (DataFlow AI) & Thomas Martin (Headless CRM)\n\nInscrivez-vous dès maintenant !\n\nÀ bientôt.', user_id: 'user-2', created_at: '2026-01-05T11:00:00Z', updated_at: '2026-01-22T16:00:00Z' },
  { id: 'camp-3', name: 'LinkedIn Ads - Notoriété', type: 'social', status: 'active', start_date: '2025-12-01', end_date: '2026-02-28', budget: 8000, description: 'Campagne de notoriété LinkedIn Ads ciblant les décideurs IT PME/ETI en France.', subject: '', message_body: '', user_id: 'user-2', created_at: '2025-11-25T10:00:00Z', updated_at: '2026-01-15T09:00:00Z' },
  { id: 'camp-4', name: 'Nurturing Clients Existants', type: 'email', status: 'active', start_date: '2025-10-01', end_date: null, budget: 1500, description: 'Séquence email automatisée pour fidéliser les clients actifs : tips, nouveautés, invitations événements.', subject: 'Les nouveautés du mois', message_body: 'Bonjour,\n\nVoici les nouveautés de ce mois :\n\n1. Nouveau tableau de bord analytics\n2. Export CSV amélioré\n3. Intégration Slack\n\nBonne découverte !', user_id: 'user-3', created_at: '2025-09-20T14:00:00Z', updated_at: '2026-01-10T11:00:00Z' },
  { id: 'camp-5', name: 'Salon Tech Paris 2025', type: 'event', status: 'completed', start_date: '2025-11-15', end_date: '2025-11-17', budget: 15000, description: 'Stand au salon Tech Paris. Bilan : 120 contacts collectés, 8 RDV qualifiés.', subject: 'Retrouvez-nous au Salon Tech Paris !', message_body: 'Bonjour,\n\nNous serons présents au Salon Tech Paris du 15 au 17 novembre 2025, stand B42.\n\nVenez découvrir nos solutions CRM et échanger avec notre équipe.\n\nÀ très bientôt !', user_id: 'user-1', created_at: '2025-09-01T08:00:00Z', updated_at: '2025-11-25T17:00:00Z' },
];

export const seedCampaignPeople: CampaignPerson[] = [
  { id: 'cp-1', campaign_id: 'camp-1', person_id: 'pers-1', status: 'sent', created_at: '2026-01-15T10:00:00Z' },
  { id: 'cp-2', campaign_id: 'camp-1', person_id: 'pers-3', status: 'sent', created_at: '2026-01-15T10:00:00Z' },
  { id: 'cp-3', campaign_id: 'camp-1', person_id: 'pers-4', status: 'opened', created_at: '2026-01-15T10:00:00Z' },
  { id: 'cp-4', campaign_id: 'camp-1', person_id: 'pers-8', status: 'clicked', created_at: '2026-01-15T10:00:00Z' },
  { id: 'cp-5', campaign_id: 'camp-1', person_id: 'pers-13', status: 'sent', created_at: '2026-01-15T10:00:00Z' },
  { id: 'cp-6', campaign_id: 'camp-2', person_id: 'pers-6', status: 'pending', created_at: '2026-01-20T09:00:00Z' },
  { id: 'cp-7', campaign_id: 'camp-2', person_id: 'pers-7', status: 'pending', created_at: '2026-01-20T09:00:00Z' },
  { id: 'cp-8', campaign_id: 'camp-2', person_id: 'pers-14', status: 'pending', created_at: '2026-01-20T09:00:00Z' },
  { id: 'cp-9', campaign_id: 'camp-3', person_id: 'pers-1', status: 'sent', created_at: '2025-12-01T10:00:00Z' },
  { id: 'cp-10', campaign_id: 'camp-3', person_id: 'pers-6', status: 'sent', created_at: '2025-12-01T10:00:00Z' },
  { id: 'cp-11', campaign_id: 'camp-3', person_id: 'pers-8', status: 'sent', created_at: '2025-12-01T10:00:00Z' },
  { id: 'cp-12', campaign_id: 'camp-4', person_id: 'pers-1', status: 'opened', created_at: '2025-10-01T10:00:00Z' },
  { id: 'cp-13', campaign_id: 'camp-4', person_id: 'pers-2', status: 'clicked', created_at: '2025-10-01T10:00:00Z' },
  { id: 'cp-14', campaign_id: 'camp-4', person_id: 'pers-5', status: 'opened', created_at: '2025-10-01T10:00:00Z' },
  { id: 'cp-15', campaign_id: 'camp-4', person_id: 'pers-11', status: 'sent', created_at: '2025-10-01T10:00:00Z' },
  { id: 'cp-16', campaign_id: 'camp-4', person_id: 'pers-12', status: 'opened', created_at: '2025-10-01T10:00:00Z' },
  { id: 'cp-17', campaign_id: 'camp-5', person_id: 'pers-3', status: 'sent', created_at: '2025-11-15T08:00:00Z' },
  { id: 'cp-18', campaign_id: 'camp-5', person_id: 'pers-10', status: 'sent', created_at: '2025-11-15T08:00:00Z' },
  { id: 'cp-19', campaign_id: 'camp-5', person_id: 'pers-13', status: 'sent', created_at: '2025-11-15T08:00:00Z' },
];
