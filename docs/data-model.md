# Data Model

Types TypeScript dans `src/data/seed.ts`. Données en mémoire via `DataContext`.

## Entités

### Company

| Champ | Type | Description |
|-------|------|-------------|
| id | string | Identifiant unique |
| name | string | Nom de l'entreprise |
| industry | string | Secteur d'activité |
| website | string | URL site web |
| phone | string | Téléphone |
| email | string | Email de contact |
| address | string | Adresse postale |
| city | string | Ville |
| country | string | Pays |
| notes | string | Notes libres |
| user_id | string | Créateur |
| created_at | string | Date de création (ISO) |
| updated_at | string | Dernière modification (ISO) |

### Contact

| Champ | Type | Description |
|-------|------|-------------|
| id | string | Identifiant unique |
| company_id | string \| null | FK → Company |
| first_name | string | Prénom |
| last_name | string | Nom |
| email | string | Email |
| phone | string | Téléphone |
| job_title | string | Fonction |
| notes | string | Notes libres |
| user_id | string | Créateur |
| created_at | string | ISO |
| updated_at | string | ISO |

### Campaign

| Champ | Type | Description |
|-------|------|-------------|
| id | string | Identifiant unique |
| name | string | Nom de la campagne |
| type | string | `email`, `social`, `ads`, `event`, `other` |
| status | string | `draft`, `active`, `paused`, `completed` |
| start_date | string \| null | Date de début |
| end_date | string \| null | Date de fin |
| budget | number | Budget en euros |
| description | string | Description |
| subject | string | Objet du message |
| message_body | string | Corps du message |
| user_id | string | Créateur |
| created_at | string | ISO |
| updated_at | string | ISO |

### CampaignContact

| Champ | Type | Description |
|-------|------|-------------|
| id | string | Identifiant unique |
| campaign_id | string | FK → Campaign |
| contact_id | string | FK → Contact |
| status | string | `pending`, `sent`, `opened`, `clicked`, `responded` |
| created_at | string | ISO |

## Relations

```
Company 1──N Contact
Campaign N──N Contact (via CampaignContact)
```

## Seed Data

| Entité | Nombre |
|--------|--------|
| DemoUser | 3 |
| Company | 8 |
| Contact | 14 |
| Campaign | 5 |
| CampaignContact | 19 |

Données définies dans `src/data/seed.ts`.
