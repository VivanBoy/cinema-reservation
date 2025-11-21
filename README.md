# 🎬Cinéma – Réservation

Application web complète de **réservation de billets de cinéma** développée dans le cadre du cours  
*Introduction à la programmation de serveurs Web (Node.js / Express / MySQL / EJS)*.

- Authentification (inscription / connexion) avec **JWT**
- Gestion des **films**, **salles**, **séances** et **réservations**
- Interface utilisateur en **EJS + Bootstrap**
- Séparation **API REST** (`/api/...`) et **pages EJS** (`/films-ejs`, `/reservations-ejs`, etc.)

---

## Structure du projet

```text
cinema-reservation/
├─ config/
│  └─ connection.js         # Connexion MySQL (Sequelize)
├─ controllers/
│  └─ authController.js     # Login / Register
├─ frontend/
│  ├─ index.html            # Page d'accueil (Login + Inscription)
│  ├─ js/
│  │  └─ auth.js            # Appels API /auth depuis la page d'accueil
│  └─ img/                  # Affiches des films
├─ middleware(s)/
│  ├─ auth.js               # Middleware JWT pour l’API
│  └─ isAdmin.js            # Vérification du rôle admin
├─ models/
│  ├─ index.js              # Associations Sequelize
│  ├─ User.js, Role.js      # Utilisateurs & rôles
│  ├─ Movie.js              # Films
│  ├─ Room.js               # Salles
│  ├─ Showtime.js           # Séances
│  └─ Booking.js            # Réservations
├─ routes/
│  ├─ authRoutes.js         # /api/auth
│  ├─ movieRoutes.js        # /api/movies
│  ├─ roomRoutes.js         # /api/rooms
│  ├─ showtimeRoutes.js     # /api/showtimes
│  └─ bookingRoutes.js      # /api/bookings
├─ views/
│  ├─ films.ejs             # Liste des films
│  ├─ film-details.ejs      # Détails d’un film
│  ├─ showtimes.ejs         # Séances d’un film
│  ├─ reservations.ejs      # Mes réservations
│  ├─ reservations-no-user.ejs # Message si aucun userId
│  ├─ admin-new-movie.ejs   # Formulaire ajout de film
│  ├─ admin-new-showtime.ejs# Formulaire ajout de séance
│  └─ partials/
│     ├─ header.ejs
│     ├─ footer.ejs
│     └─ navbar.ejs         # Barre de navigation + "Mes réservations" + Admin
├─ .env                     # Variables d’environnement (non versionné)
├─ server.js                # Point d’entrée Node / Express
├─ package.json
└─ README.md
```
---
## Technologies utilisées
Back-end
Node.js, Express
Sequelize (ORM) + MySQL
JWT (jsonwebtoken)
bcryptjs
express-validator
cors
dotenv
Front-end
HTML5, CSS3, Bootstrap 5
EJS (templates côté serveur)
JavaScript vanilla (fetch API)

## Installation & configuration
1. Cloner le dépôt
git clone https://github.com/VivanBoy/cinema-reservation.git
cd cinema-reservation
2. Installer les dépendances
bash
Copy code
npm install
3. Créer la base de données MySQL
Dans MySQL :

sql
Copy code
CREATE DATABASE cinema_reservation
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
4. Configurer les variables d’environnement
Créer un fichier .env à la racine :

env
Copy code
DB_NAME=cinema_reservation
DB_USER=root
DB_PASSWORD=VOTRE_MOT_DE_PASSE_MYSQL
DB_HOST=localhost
DB_DIALECT=mysql

PORT=5000
JWT_SECRET=supersecretkey
5. Synchroniser les modèles Sequelize & lancer le serveur
Assurez-vous que votre serveur MySQL est démarré, puis lancez :

bash
Copy code
npm run dev
Vous devriez voir dans la console :

text
Copy code
Server running on port 5000
Database connected successfully from Node!
## Comptes & rôles
Inscription : via la page d’accueil (/) ou l’endpoint API /api/auth/register.
Connexion : via /api/auth/login (utilisé par frontend/index.html).
Par défaut :
un compte créé via l’interface est enregistré avec le rôle client.
le rôle admin doit être attribué manuellement dans la base de données
(table roles + table de jointure user_roles), ou via un script d’init.
## Exemple simplifié pour créer un rôle admin et l’assigner à un utilisateur (id = 1) :

```text
sql
Copy code
INSERT INTO roles (name) VALUES ('admin');            -- une seule fois
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);  -- user 1 devient admin
```
Dans l’interface :
seul un utilisateur admin voit le menu Admin (ajout film / séance),
les utilisateurs "client" peuvent consulter les films, réserver et voir leurs réservations.

Lancer l’application
```text
npm run dev
Backend : http://localhost:5000
Page d’accueil (login + inscription) : http://localhost:5000/
Pages EJS :
Liste des films : http://localhost:5000/films-ejs
Détails d’un film : http://localhost:5000/films-ejs/:id
Séances d’un film : http://localhost:5000/films-ejs/:id/showtimes
Mes réservations : http://localhost:5000/reservations-ejs?userId=...
Admin – ajout film : http://localhost:5000/admin/movies/new
Admin – ajout séance : http://localhost:5000/admin/showtimes/new
```
## API – exemples (Postman)
Auth
POST /api/auth/register
Body (JSON) :
```text
{
  "first_name": "Jeanne",
  "last_name": "Doe",
  "email": "jeanne@example.com",
  "username": "jeanne",
  "password": "secret"
}
```
POST /api/auth/login

```text
{
  "username": "jeanne",
  "password": "secret"
}
```
Réponse (exemple) :

```text
{
  "token": "JWT...",
  "user": {
    "id": 2,
    "username": "jeanne",
    "roles": ["client"]
  }
}
```
## Films
GET /api/movies – liste des films
GET /api/movies/:id – détails d’un film
PUT /api/movies/:id – mise à jour (admin uniquement)

Exemple de body JSON pour mise à jour :
```text
{
  "description": "Nouvelle description du film..."
}
```
Header :
Authorization: Bearer <token_admin>
Réservations (démo)
POST /api/bookings

Headers :
Authorization: Bearer <token>
Content-Type: application/json
# Body :

```text
{
  "showtime_id": 1,
  "total_price": 12.5
}
```
## Fonctionnalités principales
Inscription & connexion (JWT)
Rôles : client / admin
CRUD de films (via API + pages admin)
Gestion des salles & séances
Réservation d’une séance (démo)
Page Mes réservations qui affiche uniquement les réservations de l’utilisateur connecté
Front-end responsive avec Bootstrap 5

## Pistes d’amélioration
Choix du nombre de sièges à la réservation
Gestion d’un plan de salle (places disponibles/occupées)
Filtrage / recherche de films
Pagination / tri sur les listes
Dashboard admin plus complet

## Contexte pédagogique
Ce projet a été réalisé dans le cadre du cours :

Introduction à la programmation de serveurs Web
Collège La Cité – A2025
Stack : Node.js, Express, MySQL, EJS, API REST, Auth JWT

# Il illustre :
la structure d’une application Node/Express,
l’utilisation d’un ORM (Sequelize) avec MySQL,
l’intégration d’un front léger EJS + Bootstrap,
l’authentification par tokens (JWT) et la gestion de rôles.
