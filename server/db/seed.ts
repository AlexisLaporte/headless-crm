import 'dotenv/config';
import { db } from './index.js';
import { users, organizations, people, campaigns, campaignPeople } from './schema.js';

async function seed() {
  console.log('Seeding database...');

  // Insert demo users
  const [marie, thomas, sophie] = await db
    .insert(users)
    .values([
      { name: 'Marie Dupont', email: 'marie.dupont@techvision.fr', role: 'Directrice Commerciale', avatar: 'MD' },
      { name: 'Thomas Martin', email: 'thomas.martin@techvision.fr', role: 'Responsable Marketing', avatar: 'TM' },
      { name: 'Sophie Bernard', email: 'sophie.bernard@techvision.fr', role: 'Account Manager', avatar: 'SB' },
    ])
    .onConflictDoNothing()
    .returning();

  if (!marie) {
    console.log('Users already exist, skipping seed.');
    process.exit(0);
  }

  const userMap: Record<string, string> = {
    'user-1': marie.id,
    'user-2': thomas.id,
    'user-3': sophie.id,
  };

  // Insert organizations
  const orgRows = await db
    .insert(organizations)
    .values([
      { name: 'TechVision SAS', industry: 'Technologies', website: 'https://techvision.fr', phone: '+33 1 42 68 53 00', email: 'contact@techvision.fr', address: '15 rue de la Paix', city: 'Paris', country: 'France', notes: 'Client historique, renouvellement contrat Q2 2026', user_id: userMap['user-1'] },
      { name: 'BioNature Labs', industry: 'Santé / Biotech', website: 'https://bionature-labs.com', phone: '+33 4 72 33 21 00', email: 'info@bionature-labs.com', address: '8 avenue Lacassagne', city: 'Lyon', country: 'France', notes: 'Prospect chaud, intéressé par notre offre Enterprise', user_id: userMap['user-1'] },
      { name: 'UrbanDesign Studio', industry: 'Architecture / Design', website: 'https://urbandesign.studio', phone: '+33 5 56 44 12 00', email: 'hello@urbandesign.studio', address: "22 cours de l'Intendance", city: 'Bordeaux', country: 'France', notes: "Partenaire agence, apporteur d'affaires régulier", user_id: userMap['user-1'] },
      { name: 'DataFlow AI', industry: 'Data / Intelligence Artificielle', website: 'https://dataflow-ai.com', phone: '+33 5 61 22 33 44', email: 'contact@dataflow-ai.com', address: '3 impasse Barbet', city: 'Toulouse', country: 'France', notes: 'Startup en forte croissance, levée de fonds récente', user_id: userMap['user-2'] },
      { name: 'GreenEnergy Solutions', industry: 'Énergie renouvelable', website: 'https://greenenergy-solutions.fr', phone: '+33 2 40 55 66 77', email: 'commercial@greenenergy-solutions.fr', address: '12 boulevard de la Prairie', city: 'Nantes', country: 'France', notes: 'Grand compte, 3 projets en cours', user_id: userMap['user-2'] },
      { name: 'MediaPulse Agency', industry: 'Média / Communication', website: 'https://mediapulse.agency', phone: '+33 4 91 33 44 55', email: 'bonjour@mediapulse.agency', address: '45 rue Paradis', city: 'Marseille', country: 'France', notes: "Nouveau client depuis novembre, phase d'onboarding", user_id: userMap['user-3'] },
      { name: 'LogiTrans Europe', industry: 'Logistique / Transport', website: 'https://logitrans.eu', phone: '+33 3 88 22 11 00', email: 'info@logitrans.eu', address: '7 rue du Fossé des Treize', city: 'Strasbourg', country: 'France', notes: 'Contrat cadre signé, déploiement en cours sur 5 sites', user_id: userMap['user-3'] },
      { name: 'EduSmart', industry: 'EdTech / Formation', website: 'https://edusmart.io', phone: '+33 1 55 66 77 88', email: 'partenariats@edusmart.io', address: '30 rue des Petits Champs', city: 'Paris', country: 'France', notes: 'Prospect qualifié, démo planifiée pour février', user_id: userMap['user-1'] },
    ])
    .returning();

  const orgMap: Record<string, string> = {};
  const orgNames = ['TechVision SAS', 'BioNature Labs', 'UrbanDesign Studio', 'DataFlow AI', 'GreenEnergy Solutions', 'MediaPulse Agency', 'LogiTrans Europe', 'EduSmart'];
  orgNames.forEach((name, i) => {
    orgMap[`org-${i + 1}`] = orgRows[i].id;
  });

  // Insert people
  const personRows = await db
    .insert(people)
    .values([
      { first_name: 'Jean-Pierre', last_name: 'Moreau', email: 'jp.moreau@techvision.fr', phone: '+33 6 12 34 56 78', job_title: 'CEO', notes: 'Décideur principal, préfère les appels le matin', organization_id: orgMap['org-1'], user_id: userMap['user-1'] },
      { first_name: 'Claire', last_name: 'Fontaine', email: 'c.fontaine@techvision.fr', phone: '+33 6 23 45 67 89', job_title: 'Directrice Technique', notes: 'Contact technique pour les intégrations API', organization_id: orgMap['org-1'], user_id: userMap['user-1'] },
      { first_name: 'Luc', last_name: 'Renard', email: 'l.renard@bionature-labs.com', phone: '+33 6 34 56 78 90', job_title: 'Directeur R&D', notes: 'Très intéressé par les fonctionnalités analytics', organization_id: orgMap['org-2'], user_id: userMap['user-1'] },
      { first_name: 'Isabelle', last_name: 'Petit', email: 'i.petit@bionature-labs.com', phone: '+33 6 45 67 89 01', job_title: 'Responsable Achats', notes: 'Gère le budget IT, contact pour la facturation', organization_id: orgMap['org-2'], user_id: userMap['user-1'] },
      { first_name: 'Antoine', last_name: 'Leroy', email: 'antoine@urbandesign.studio', phone: '+33 6 56 78 90 12', job_title: 'Fondateur & Architecte', notes: 'Contact principal, nous recommande à ses clients', organization_id: orgMap['org-3'], user_id: userMap['user-1'] },
      { first_name: 'Nadia', last_name: 'Cheng', email: 'nadia.cheng@dataflow-ai.com', phone: '+33 6 67 89 01 23', job_title: 'CTO', notes: 'Background ML, cherche une solution scalable', organization_id: orgMap['org-4'], user_id: userMap['user-2'] },
      { first_name: 'Hugo', last_name: 'Blanc', email: 'hugo.blanc@dataflow-ai.com', phone: '+33 6 78 90 12 34', job_title: 'Head of Sales', notes: 'Contact commercial, très réactif par email', organization_id: orgMap['org-4'], user_id: userMap['user-2'] },
      { first_name: 'Émilie', last_name: 'Garnier', email: 'e.garnier@greenenergy-solutions.fr', phone: '+33 6 89 01 23 45', job_title: 'Directrice Générale', notes: 'Décideuse finale, très orientée ROI', organization_id: orgMap['org-5'], user_id: userMap['user-2'] },
      { first_name: 'Marc', last_name: 'Dubois', email: 'm.dubois@greenenergy-solutions.fr', phone: '+33 6 90 12 34 56', job_title: 'Responsable IT', notes: 'Gère les 3 projets en cours, point de contact opérationnel', organization_id: orgMap['org-5'], user_id: userMap['user-2'] },
      { first_name: 'Camille', last_name: 'Roche', email: 'camille@mediapulse.agency', phone: '+33 6 01 23 45 67', job_title: 'Directrice de Création', notes: 'Premier contact, très enthousiaste sur le produit', organization_id: orgMap['org-6'], user_id: userMap['user-3'] },
      { first_name: 'Philippe', last_name: 'Weber', email: 'p.weber@logitrans.eu', phone: '+33 6 11 22 33 44', job_title: 'Directeur des Opérations', notes: 'Supervise le déploiement multi-sites', organization_id: orgMap['org-7'], user_id: userMap['user-3'] },
      { first_name: 'Anna', last_name: 'Schmidt', email: 'a.schmidt@logitrans.eu', phone: '+33 6 22 33 44 55', job_title: 'Chef de Projet Digital', notes: 'Contact quotidien pour le suivi du déploiement', organization_id: orgMap['org-7'], user_id: userMap['user-3'] },
      { first_name: 'Julien', last_name: 'Faure', email: 'j.faure@edusmart.io', phone: '+33 6 33 44 55 66', job_title: 'CEO & Co-fondateur', notes: 'Prospect chaud, démo prévue début février', organization_id: orgMap['org-8'], user_id: userMap['user-1'] },
      { first_name: 'Vincent', last_name: 'Lemaire', email: 'vincent.lemaire@gmail.com', phone: '+33 6 44 55 66 77', job_title: 'Consultant indépendant', notes: 'Freelance, potentiel prescripteur', organization_id: null, user_id: userMap['user-2'] },
    ])
    .returning();

  const persMap: Record<string, string> = {};
  personRows.forEach((p, i) => {
    persMap[`pers-${i + 1}`] = p.id;
  });

  // Insert campaigns
  const campaignRows = await db
    .insert(campaigns)
    .values([
      { name: 'Lancement Offre Enterprise Q1 2026', type: 'email', status: 'active', start_date: '2026-01-15', end_date: '2026-03-31', budget: '5000', description: 'Campagne email ciblée pour promouvoir la nouvelle offre Enterprise auprès des prospects qualifiés et clients existants.', subject: 'Découvrez notre nouvelle offre Enterprise', message_body: "Bonjour,\n\nNous avons le plaisir de vous présenter notre nouvelle offre Enterprise, conçue pour répondre aux besoins des organisations en croissance.\n\nPoints clés :\n- Accès illimité à toutes les fonctionnalités\n- Support dédié 24/7\n- Intégrations personnalisées\n\nN'hésitez pas à nous contacter pour une démonstration.\n\nCordialement,\nL'équipe Headless CRM", user_id: userMap['user-1'] },
      { name: 'Webinar IA & Data - Février', type: 'event', status: 'draft', start_date: '2026-02-20', end_date: '2026-02-20', budget: '2000', description: "Webinar co-organisé avec DataFlow AI sur les tendances IA 2026. Objectif : 150 inscrits.", subject: 'Invitation : Webinar IA & Data - 20 février 2026', message_body: "Bonjour,\n\nNous vous invitons à notre webinar exclusif sur les tendances IA & Data en 2026.\n\nDate : 20 février 2026 à 14h00\nDurée : 1h30\nIntervenants : Nadia Cheng (DataFlow AI) & Thomas Martin (Headless CRM)\n\nInscrivez-vous dès maintenant !\n\nÀ bientôt.", user_id: userMap['user-2'] },
      { name: 'LinkedIn Ads - Notoriété', type: 'social', status: 'active', start_date: '2025-12-01', end_date: '2026-02-28', budget: '8000', description: 'Campagne de notoriété LinkedIn Ads ciblant les décideurs IT PME/ETI en France.', subject: '', message_body: '', user_id: userMap['user-2'] },
      { name: 'Nurturing Clients Existants', type: 'email', status: 'active', start_date: '2025-10-01', end_date: null, budget: '1500', description: "Séquence email automatisée pour fidéliser les clients actifs : tips, nouveautés, invitations événements.", subject: 'Les nouveautés du mois', message_body: "Bonjour,\n\nVoici les nouveautés de ce mois :\n\n1. Nouveau tableau de bord analytics\n2. Export CSV amélioré\n3. Intégration Slack\n\nBonne découverte !", user_id: userMap['user-3'] },
      { name: 'Salon Tech Paris 2025', type: 'event', status: 'completed', start_date: '2025-11-15', end_date: '2025-11-17', budget: '15000', description: 'Stand au salon Tech Paris. Bilan : 120 contacts collectés, 8 RDV qualifiés.', subject: 'Retrouvez-nous au Salon Tech Paris !', message_body: "Bonjour,\n\nNous serons présents au Salon Tech Paris du 15 au 17 novembre 2025, stand B42.\n\nVenez découvrir nos solutions CRM et échanger avec notre équipe.\n\nÀ très bientôt !", user_id: userMap['user-1'] },
    ])
    .returning();

  const campMap: Record<string, string> = {};
  campaignRows.forEach((c, i) => {
    campMap[`camp-${i + 1}`] = c.id;
  });

  // Insert campaign_people
  await db.insert(campaignPeople).values([
    { campaign_id: campMap['camp-1'], person_id: persMap['pers-1'], status: 'sent' },
    { campaign_id: campMap['camp-1'], person_id: persMap['pers-3'], status: 'sent' },
    { campaign_id: campMap['camp-1'], person_id: persMap['pers-4'], status: 'opened' },
    { campaign_id: campMap['camp-1'], person_id: persMap['pers-8'], status: 'clicked' },
    { campaign_id: campMap['camp-1'], person_id: persMap['pers-13'], status: 'sent' },
    { campaign_id: campMap['camp-2'], person_id: persMap['pers-6'], status: 'pending' },
    { campaign_id: campMap['camp-2'], person_id: persMap['pers-7'], status: 'pending' },
    { campaign_id: campMap['camp-2'], person_id: persMap['pers-14'], status: 'pending' },
    { campaign_id: campMap['camp-3'], person_id: persMap['pers-1'], status: 'sent' },
    { campaign_id: campMap['camp-3'], person_id: persMap['pers-6'], status: 'sent' },
    { campaign_id: campMap['camp-3'], person_id: persMap['pers-8'], status: 'sent' },
    { campaign_id: campMap['camp-4'], person_id: persMap['pers-1'], status: 'opened' },
    { campaign_id: campMap['camp-4'], person_id: persMap['pers-2'], status: 'clicked' },
    { campaign_id: campMap['camp-4'], person_id: persMap['pers-5'], status: 'opened' },
    { campaign_id: campMap['camp-4'], person_id: persMap['pers-11'], status: 'sent' },
    { campaign_id: campMap['camp-4'], person_id: persMap['pers-12'], status: 'opened' },
    { campaign_id: campMap['camp-5'], person_id: persMap['pers-3'], status: 'sent' },
    { campaign_id: campMap['camp-5'], person_id: persMap['pers-10'], status: 'sent' },
    { campaign_id: campMap['camp-5'], person_id: persMap['pers-13'], status: 'sent' },
  ]);

  console.log('Seed completed!');
  console.log(`  ${3} users`);
  console.log(`  ${orgRows.length} organizations`);
  console.log(`  ${personRows.length} people`);
  console.log(`  ${campaignRows.length} campaigns`);
  console.log(`  19 campaign_people`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
