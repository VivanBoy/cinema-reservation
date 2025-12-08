# 🎬 Cinéma – Réservation

Application web complète de **réservation de billets de cinéma** développée dans le cadre du cours  
*Introduction à la programmation de serveurs Web (Node.js / Express / MySQL / EJS)*.

- Authentification (inscription / connexion) avec **JWT**
- Gestion des **films**, **salles**, **séances** et **réservations**
- Interface utilisateur en **EJS + Bootstrap**
- Séparation **API REST JSON** (`/api/...`) et **pages EJS** (`/films-ejs`, `/reservations-ejs`, etc.)
- Parcours **client** (consultation / réservation / annulation) et **admin** (gestion catalogue cinéma)

---

## 🧱 Structure du projet

```text
cinema-reservation/
├─ config/
│  └─ connection.js           # Connexion MySQL (Sequelize)
├─ controllers/
│  ├─ authController.js       # Login / Register
│  ├─ movieController.js      # CRUD films (API)
│  ├─ roomController.js       # CRUD salles (API)
│  ├─ showtimeController.js   # CRUD séances (API)
│  └─ bookingController.js    # Réservations (API)
├─ frontend/
│  ├─ index.html              # Page d'accueil (Login + Inscription)
│  ├─ js/
│  │  ├─ auth.js              # Auth côté front + stockage localStorage
│  │  ├─ api.js               # Helper fetch()/token pour l’API
│  │  ├─ movies.js            # Chargement films côté page d’accueil (si utilisé)
│  │  └─ reservations.js      # Appels API pour les réservations (JSON)
│  └─ img/                    # Affiches des films (posters)
├─ middleware/
│  ├─ authMiddleware.js       # Middleware JWT pour l’API (req.user)
│  ├─ auth.js                 # (optionnel) Auth pour certaines routes EJS
│  └─ isAdmin.js              # Vérification du rôle admin
├─ models/
│  ├─ index.js                # Init Sequelize + associations
│  ├─ User.js, Role.js        # Utilisateurs & rôles
│  ├─ Movie.js                # Films
│  ├─ Room.js                 # Salles
│  ├─ Showtime.js             # Séances
│  └─ Booking.js              # Réservations
├─ routes/
│  ├─ authRoutes.js           # /api/auth
│  ├─ movieRoutes.js          # /api/movies
│  ├─ roomRoutes.js           # /api/rooms
│  ├─ showtimeRoutes.js       # /api/showtimes
│  └─ bookingRoutes.js        # /api/bookings
├─ views/
│  ├─ films.ejs               # Liste des films (+ pagination)
│  ├─ film-details.ejs        # Détails d’un film
│  ├─ showtimes.ejs           # Séances d’un film + bouton "Réserver"
│  ├─ reservations.ejs        # Mes réservations + bouton "Annuler la réservation"
│  ├─ reservations-no-user.ejs# Message explicatif si aucun utilisateur
│  ├─ admin-new-movie.ejs     # Admin – ajout de film
│  ├─ admin-edit-movie.ejs    # Admin – modification de film
│  ├─ admin-new-showtime.ejs  # Admin – ajout de séance
│  ├─ admin-edit-showtime.ejs # Admin – modification de séance
│  └─ partials/
│     ├─ header.ejs
│     ├─ footer.ejs
│     └─ navbar.ejs           # Barre de navigation + "Mes réservations" + Admin
├─ .env                       # Variables d’environnement (non versionné)
├─ server.js                  # Point d’entrée Node / Express
├─ package.json
└─ README.md
```
# Technologies utilisées
### Back-end

Node.js, Express

Sequelize (ORM) + MySQL

JWT (jsonwebtoken) pour l’authentification

bcryptjs pour le hachage des mots de passe

express-validator (validation des entrées)

cors

dotenv

### Front-end

HTML5, CSS3, Bootstrap 5

EJS (templates côté serveur)

JavaScript vanilla (Fetch API, gestion du localStorage)

# Installation & configuration
1. Cloner le dépôt
```bash
git clone https://github.com/VivanBoy/cinema-reservation.git
cd cinema-reservation
```
# Documentation du Projet Cinéma

## 2. Installer les dépendances

```bash
npm install
```

## 3. Créer la base de données MySQL

Dans votre client MySQL :

```sql
CREATE DATABASE cinema_reservation
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

## 4. Configurer les variables d’environnement

Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
DB_NAME=cinema_reservation
DB_USER=root
DB_PASSWORD=VOTRE_MOT_DE_PASSE_MYSQL
DB_HOST=localhost
DB_DIALECT=mysql

PORT=5000
JWT_SECRET=supersecretkey
```

## 5. Synchroniser les modèles Sequelize & lancer le serveur

Assurez-vous que MySQL est démarré, puis lancez :

```bash
npm run dev
```

Vous devriez voir dans la console :

> Server running on port 5000
> Database connected successfully from Node!

---

##  Comptes & rôles

* **Inscription :** via la page d’accueil (`/`) ou l’endpoint API `/api/auth/register`.
* **Connexion :** via `/api/auth/login` (utilisé par `frontend/index.html`).

**Par défaut :**
* Un compte créé via l’interface est enregistré avec le rôle **client**.
* Le rôle **admin** doit être attribué manuellement dans la base de données (table `roles` + table de jointure `user_roles`), ou via un script d’init.

**Exemple SQL pour créer un rôle admin et l’assigner à un utilisateur (id = 1) :**

```sql
-- à faire une seule fois
INSERT INTO roles (name) VALUES ('admin');

-- user 1 devient admin
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);
```

**Dans l’interface :**
* Seul un utilisateur admin (par exemple `ino1`) voit le menu **Admin** (ajout / modification de film et de séance).
* Les utilisateurs clients peuvent consulter les films, réserver et voir/annuler leurs réservations.

---

##  Lancer l’application

**Commande de développement :**

```bash
npm run dev
```

**URLs principales :**

* **Backend API :** `http://localhost:5000/api`
* **Page d’accueil (login + inscription) :** `http://localhost:5000/`

**Pages EJS :**
* **Liste des films :** `GET /films-ejs`
* **Détails d’un film :** `GET /films-ejs/:id`
* **Séances d’un film :** `GET /films-ejs/:id/showtimes`
* **Mes réservations :**
    * recommandé : `GET /reservations-ejs?username=<nom_utilisateur>`
    * reste compatible : `GET /reservations-ejs?userId=<id>`
* **Admin – ajout film :** `GET /admin/movies/new`
* **Admin – modification film :** `GET /admin/movies/:id/edit`
* **Admin – ajout séance :** `GET /admin/showtimes/new`
* **Admin – modification séance :** `GET /admin/showtimes/:id/edit`

> **Note :** La navbar lit les informations utilisateur dans `localStorage` (`cinemaUser`) et :
> * Affiche "Connecté : username".
> * Colore l’onglet courant.
> * Masque/affiche automatiquement le menu Admin et les boutons marqués `.js-admin-only`.
> * Redirige le bouton "Mes réservations" vers `/reservations-ejs?username=<username>`.

---

##  Parcours fonctionnels

### Côté client
1.  L’utilisateur s’inscrit ou se connecte depuis la page d’accueil.
2.  Le token JWT et les infos utilisateur sont stockés dans `localStorage` (`cinemaUser`).
3.  Depuis la page **Films** (`/films-ejs`) il peut :
    * Parcourir les films avec pagination (3 films/page).
    * Accéder aux détails d’un film.
    * Consulter les séances d’un film.
4.  Depuis la page **Séances** (`/films-ejs/:id/showtimes`), il peut :
    * Voir les horaires, la salle et le prix.
    * Cliquer sur **Réserver** pour créer une réservation (appel `POST /api/bookings`).
5.  Dans **Mes réservations** (`/reservations-ejs?username=...`), il voit :
    * La liste de ses réservations (titre du film, salle, date/heure, statut, date de réservation).
    * Un bouton **Annuler la réservation** qui envoie `DELETE /api/bookings/:id`.

### Côté admin (ino1 ou rôle admin)
Le menu **Admin** dans la navbar permet :

* **Films :**
    * Admin → **Ajouter un film** (`/admin/movies/new`) → Formulaire avec validation serveur.
    * Depuis la liste des films, un bouton **Modifier** (classe `.js-admin-only`) ouvre `/admin/movies/:id/edit`.
* **Séances :**
    * Admin → **Ajouter une séance** (`/admin/showtimes/new`).
    * Depuis la page des séances d’un film, un bouton **Modifier la séance** (classe `.js-admin-only`) ouvre `/admin/showtimes/:id/edit`.

---

##  API – exemples (Postman / Thunder Client)

### Auth

**POST** `/api/auth/register`
*Body (JSON) :*
```json
{
  "first_name": "Jeanne",
  "last_name": "Doe",
  "email": "jeanne@example.com",
  "username": "jeanne",
  "password": "secret"
}
```

**POST** `/api/auth/login`
```json
{
  "username": "jeanne",
  "password": "secret"
}
```
*Réponse (exemple) :*
```json
{
  "token": "JWT...",
  "user": {
    "id": 2,
    "username": "jeanne",
    "roles": ["client"]
  }
}
```

### Films

* `GET /api/movies` – liste des films
* `GET /api/movies/:id` – détails d’un film
* `POST /api/movies` – création d’un film (admin)
* `PUT /api/movies/:id` – mise à jour d’un film (admin)
* `DELETE /api/movies/:id` – suppression d’un film (admin)

*Exemple de body JSON pour mise à jour :*
```json
{
  "description": "Nouvelle description du film...",
  "duration_minutes": 150
}
```
*Headers (admin) :*
```text
Authorization: Bearer <token_admin>
Content-Type: application/json
```

### Réservations (API)

**Créer une réservation**
`POST /api/bookings`

*Headers :*
```text
Authorization: Bearer <token_client>
Content-Type: application/json
```
*Body :*
```json
{
  "showtime_id": 1,
  "total_price": 12.5
}
```

**Récupérer mes réservations (JSON)**
`GET /api/bookings/me`

*Headers :*
```text
Authorization: Bearer <token_client>
```

**Annuler une réservation**
`DELETE /api/bookings/:id`

*Headers :*
```text
Authorization: Bearer <token_client_ou_admin>
```
> **Règle :** Un client ne peut annuler que ses propres réservations. Un admin (ino1 ou rôle admin) peut annuler n’importe quelle réservation.

---

##  Fonctionnalités principales

* Inscription & connexion (JWT).
* Gestion des rôles : client / admin.
* CRUD de films (API + pages admin EJS).
* Gestion des salles & séances.
* Réservation d’une séance (API + boutons EJS).
* Page **Mes réservations** :
    * Filtrée sur l’utilisateur connecté.
    * Annulation de réservation via API (`DELETE /api/bookings/:id`).
* Front-end responsive avec **Bootstrap 5**.
* Navbar dynamique (localStorage, rôle admin, surbrillance de la page active).

---

##  Pistes d’amélioration

* Choix du nombre de sièges lors de la réservation.
* Gestion d’un plan de salle (places disponibles / occupées).
* Filtrage / recherche de films (par genre, durée, date de sortie, etc.).
* Tri avancé (note, popularité).
* Dashboard admin plus complet (statistiques de réservations, revenus par film).
* Génération de PDF ou QR code réel pour chaque réservation.

---

##  Contexte pédagogique

Ce projet a été réalisé dans le cadre du cours :
**Introduction à la programmation de serveurs Web**
*Collège La Cité – A2025*

**Stack principale :** Node.js, Express, MySQL, Sequelize, EJS, API REST, Auth JWT.

Il illustre :
* La structure d’une application Node/Express.
* L’utilisation d’un ORM (Sequelize) avec MySQL.
* L’intégration d’un front léger EJS + Bootstrap.
* L’authentification par tokens (JWT) et la gestion de rôles.

---

##  Contribution d’Innocent

1.  **Mise en place de la pagination** sur la liste des films (`/films-ejs?page=...`).
2.  **Intégration complète de la page « Mes réservations » :**
    * Récupération des réservations pour l’utilisateur connecté.
    * Affichage détaillé (film, salle, horaire, statut).
    * Ajout du bouton « Annuler la réservation » (API `DELETE /api/bookings/:id`).
3.  **Refonte de la navbar EJS :**
    * Lecture du `localStorage` (`cinemaUser`).
    * Redirection automatique vers `/reservations-ejs?username=<username>`.
    * Affichage conditionnel du menu Admin et des boutons `.js-admin-only`.
4.  **Ajout / nettoyage des vues admin :**
    * `admin-new-movie.ejs` et `admin-edit-movie.ejs` (CRUD film côté EJS).
    * `admin-new-showtime.ejs` et `admin-edit-showtime.ejs` (CRUD séance côté EJS).
5.  **Mise à jour des routes et du comportement de l’API des réservations** pour supporter :
    * La création depuis les pages EJS de séances.
    * L’annulation sécurisée côté utilisateur/admin.