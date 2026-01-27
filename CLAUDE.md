# YACRM

Yet Another CRM — app démo React SPA avec données en mémoire (pas de backend).

## Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3 (custom theme: brand, accent, surface)
- Lucide React (icônes)
- Pas de backend — state React local + seed data

## Architecture

```
src/
  App.tsx              # Root: AuthProvider > DataProvider > Layout
  main.tsx             # Entry point
  index.css            # Tailwind + custom component classes (btn-primary, card, input-field...)
  components/
    Auth.tsx            # Sélection de profil démo (3 users, pas de password)
    Layout.tsx          # Sidebar desktop/mobile + nav ("YACRM" branding)
    Companies.tsx       # CRUD entreprises
    Contacts.tsx        # CRUD contacts (liés à company)
    Campaigns.tsx       # CRUD campagnes + navigation vers détail
    CampaignDetail.tsx  # Vue détail campagne (infos, message, contacts avec statuts)
  contexts/
    AuthContext.tsx      # Auth locale (DemoUser state, signIn/signOut)
    DataContext.tsx      # Store in-memory CRUD (companies, contacts, campaigns, campaign_contacts)
  data/
    seed.ts             # Types + données démo (8 entreprises, 14 contacts, 5 campagnes, 19 associations)
```

## Commands

```sh
npm run dev        # Dev server (localhost:5173)
npm run build      # Build production → dist/
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
```

## Conventions

- Navigation par state local (`activeTab` dans App.tsx), pas de router
- Composants page = CRUD complet avec modals inline
- Vue détail = state `selectedXxxId` dans le composant parent, rendu conditionnel
- Types définis dans `seed.ts` (Company, Contact, Campaign, CampaignContact, DemoUser)
- UI en français, code/variables en anglais
- Tailwind classes directement dans JSX + classes utilitaires dans index.css
- Données en mémoire, reset au rechargement de page

## Data Model

4 entités, toutes gérées en state React via `DataContext` :

| Entité | Description | Relations |
|--------|-------------|-----------|
| `Company` | Entreprises | — |
| `Contact` | Personnes | `company_id` → Company |
| `Campaign` | Campagnes marketing | — |
| `CampaignContact` | Junction campagne↔contact | `campaign_id`, `contact_id` |

Champs clés `Campaign` : `name`, `type`, `status`, `start_date`, `end_date`, `budget`, `description`, `subject`, `message_body`.

Status campagne : `draft`, `active`, `paused`, `completed`.
Status contact dans campagne : `pending`, `sent`, `opened`, `clicked`, `responded`.

## Demo Mode

3 profils pré-remplis (pas de mot de passe) :
- Marie Dupont — Directrice Commerciale
- Thomas Martin — Responsable Marketing
- Sophie Bernard — Account Manager

Toutes les données seed sont partagées (pas de filtrage par user_id côté front).

## Preview Deployments

Chaque PR ouverte génère un aperçu sur un sous-domaine unique.

- **URL** : `https://{branch-slug}.yacrm.tuls.me`
- **Deploy** : `.github/workflows/deploy-preview.yml` (on: pull_request opened/synchronize/reopened)
- **Cleanup** : `.github/workflows/cleanup-preview.yml` (on: pull_request closed)
- **Fichiers serveur** : `/var/www/yacrm/preview/{branch-slug}/`
- **Nginx** : `/etc/nginx/sites-available/yacrm-preview` (regex server_name wildcard)
- **SSL** : Cert `yacrm-wildcard` (`*.yacrm.tuls.me`) via `certbot-dns-scaleway`, auto-renew
- **DNS** : Record A wildcard `*.yacrm` → `51.15.225.121`
- **PWA** : désactivée en preview (`YACRM_PREVIEW=true` dans le build)

Slug : `feat/My-Branch!` → `feat-my-branch` (lowercase, alphanum+hyphens, max 63 chars)

## Deployment

Site statique déployé sur **yacrm.tuls.me**.

- **CI/CD** : `.github/workflows/deploy.yml` — build + scp `dist/` vers `/var/www/yacrm` sur push main
- **Dev local** : `dev/start.sh` — Vite port 3001, logs dans `dev/dev.log`
- **DNS** : Scaleway DNS, A record `yacrm` → `51.15.225.121`
- **SSL** : Let's Encrypt via cert `tuls.me` (multi-SAN)
- **Nginx** : `/etc/nginx/sites-enabled/yacrm`, SPA `try_files → /index.html`

## Docs

Detailed docs in `docs/`:
- `data-model.md` — Types, champs et relations des 4 entités
