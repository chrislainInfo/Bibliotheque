# Bibliothèque - Gestion de bibliothèque de quartier

## Présentation

Bibliothèque est une application web de gestion destinée à une bibliothèque de quartier. Elle permet au personnel de gérer la collection de livres, les adhérents, les emprunts, les auteurs et les catégories depuis une interface web.

Lien vers le site: https://bibliotheque-1-c36o.onrender.com/

Connexion: 
- Email: adelininfo08@gmail.com
- Password: chrislain

Le projet est composé de deux parties :

- un backend REST développé avec Node.js et Express ;
- un frontend en HTML, CSS et JavaScript vanilla, sans framework.

Le fonctionnement général est le suivant :

**Connexion → Dashboard → Gestion des livres, adhérents, emprunts, auteurs et catégories.**

## MVP actuel

Le MVP couvre le parcours principal d’un bibliothécaire :

1. authentification par email et mot de passe ;
2. consultation d’un dashboard avec les statistiques de la bibliothèque ;
3. consultation et gestion des données métier ;
4. création, modification et suppression des ressources lorsque l’action est disponible ;
5. création et suivi des emprunts, avec retour des livres ;
6. consultation des emprunts en retard et export CSV de la liste affichée.

Les données sont stockées dans PostgreSQL. L’API applique une authentification JWT et contrôle les rôles selon les routes.

## Fonctionnalités disponibles

### Authentification

- connexion d’un bibliothécaire avec son email et son mot de passe ;
- connexion d’un adhérent avec son code ;
- génération d’un token JWT ;
- stockage de la session côté frontend ;
- protection des routes par authentification et rôle.

### Dashboard

Le dashboard affiche notamment :

- le nombre de livres ;
- le nombre d’adhérents ;
- les emprunts en cours ;
- les emprunts en retard ;
- les exemplaires disponibles et empruntés ;
- les emprunts récents ;
- la liste des emprunts en retard.

### Livres

- affichage des livres ;
- recherche et filtres ;
- affichage de l’ISBN, de la catégorie, des auteurs et des exemplaires ;
- ajout, modification et suppression d’un livre ;
- gestion des associations avec les auteurs ;
- indication de la disponibilité.

### Adhérents

- affichage des adhérents ;
- recherche et pagination ;
- affichage des informations personnelles, des dates d’adhésion et du statut ;
- affichage du nombre d’emprunts actifs ;
- ajout, modification et suppression d’un adhérent.

### Emprunts

- affichage des emprunts ;
- recherche et filtrage par statut ;
- affichage du livre, de l’adhérent et des dates ;
- création et modification d’un emprunt ;
- retour d’un livre ;
- suppression d’un emprunt lorsque l’opération est autorisée ;
- identification des emprunts en cours, retournés et en retard ;
- export CSV de la liste des emprunts en retard.

### Auteurs

- affichage des auteurs ;
- recherche et pagination ;
- affichage du nombre de livres associés et de la date d’ajout ;
- ajout, modification et suppression d’un auteur.

### Catégories

- affichage des catégories ;
- recherche et pagination ;
- affichage du nombre de livres associés et de la date d’ajout ;
- ajout, modification et suppression d’une catégorie.

## Structure du projet

```text
.
├── backend/
│   ├── database/
│   │   ├── reset_seed.js
│   │   ├── schema.sql
│   │   └── seed.js
│   ├── src/
│   │   ├── app.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── errors/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   └── utils/
│   └── package.json
└── frontend/
    ├── index.html
    ├── index.js
    ├── js/
    │   ├── api.js
    │   ├── csv.js
    │   └── toast.js
    ├── css/
    ├── dashboard/
    ├── livres/
    ├── adherents/
    ├── emprunts/
    ├── auteurs/
    └── categories/
```

### Backend

Le backend est une API Node.js + Express. Les responsabilités sont séparées de la manière suivante :

- `routes/` définit les endpoints HTTP ;
- `controllers/` valide les requêtes et construit les réponses ;
- `repositories/` exécute les requêtes PostgreSQL ;
- `middleware/` gère l’authentification JWT et les rôles ;
- `config/` configure la connexion à la base de données ;
- `database/schema.sql` définit le schéma SQL ;
- `database/seed.js` contient les données de démonstration ;
- `database/reset_seed.js` réinitialise puis recharge la base de démonstration.

Les principaux préfixes d’API sont :

- `/api/auth` ;
- `/api/dashboard` ;
- `/api/livres` ;
- `/api/adherents` ;
- `/api/emprunts` ;
- `/api/auteurs` ;
- `/api/categories`.

### Frontend

Le frontend est une application statique en HTML, CSS et JavaScript vanilla. Chaque domaine métier possède sa page HTML, son script et sa feuille de style. Les outils communs se trouvent dans `frontend/js/` : appels API authentifiés, notifications toast et export CSV.

## Prérequis

- Node.js avec une version supportant `--env-file` et `--watch` ;
- npm ;
- PostgreSQL ;
- une base de données configurée pour le backend.

Le backend lit les variables d’environnement suivantes :

```text
PORT
JWT_SECRET
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
```

Créer un fichier `backend/.env` adapté à l’environnement local avant de démarrer l’API. Ce fichier ne doit pas être publié s’il contient des secrets.

## Installation et lancement

### Installer les dépendances

```bash
cd backend
npm install
```

### Préparer la base de données

Créer les tables à partir de `backend/database/schema.sql`, puis charger les données de démonstration avec :

```bash
cd backend
node --env-file=.env database/reset_seed.js
```

Cette commande réinitialise les tables concernées et recharge les comptes, catégories, adhérents, auteurs, livres et emprunts du seed.

### Lancer le backend en développement

Le projet n’utilise pas Nodemon. Le développement repose sur le watcher natif de Node.js configuré dans le script `dev` :

```bash
cd backend
npm run dev
```

### Lancer le backend en production

Le script `start` lance Node.js sans watcher :

```bash
cd backend
npm run start
```

Le port d’écoute est défini par la variable `PORT` du fichier `backend/.env`.

### Ouvrir le frontend

Le frontend ne possède pas de script npm dédié : il s’agit de fichiers statiques. Servir le dossier `frontend/` avec un serveur HTTP statique, par exemple l’extension Live Server de VS Code, puis ouvrir `frontend/index.html` depuis ce serveur.

L’API frontend utilise par défaut :

```text
http://localhost:3000/api
```

Si le backend écoute sur un autre port, adapter l’URL d’API dans les fichiers frontend concernés.

## Authentification / Compte de test

Le MVP permet aux bibliothécaires de s’authentifier avec leur email et leur mot de passe. Les comptes suivants sont définis dans `backend/database/seed.js` :

| Rôle | Email | Mot de passe |
|---|---|---|
| Bibliothécaire | `adelininfo08@gmail.com` | `chrislain` |
| Bibliothécaire | `bernard@biblio.com` | `Bernard123` |
| Bibliothécaire | `charles@biblio.com` | `Charles123` |

Ces identifiants ne sont disponibles que si les données du seed ont été chargées dans la base. Ils sont destinés au développement et aux démonstrations ; ils doivent être remplacés dans un environnement réel.

Le seed génère également des codes pour les comptes adhérents. Ces codes sont affichés dans la sortie de la commande de seed et ne sont pas fixés à l’avance.

## API et rôles

Les routes de consultation sont accessibles selon les rôles configurés par les middlewares. Les opérations de création, modification et suppression sont réservées au rôle `bibliothecaire`. Les routes dashboard et ressources utilisent un token JWT transmis dans l’en-tête :

```text
Authorization: Bearer <token>
```

## État du projet

Le dépôt contient le MVP fonctionnel de gestion d’une bibliothèque de quartier, avec une interface de gestion et une API reliée à PostgreSQL. Les scripts de test automatisés ne sont pas définis dans `backend/package.json` : la commande `npm test` est actuellement un placeholder qui retourne un message indiquant qu’aucun test n’est configuré.
