// server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/connection.js";
import "./models/index.js";
import { Movie, Room, Showtime, Booking, User } from "./models/index.js";

import authRoutes from "./routes/authRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import showtimeRoutes from "./routes/showtimeRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

dotenv.config();

const app = express();

// __dirname pour ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  EJS 
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Fichiers statiques (frontend : index.html, css, js, img, etc.)
app.use(express.static(path.join(__dirname, "frontend")));

// PAGES HTML / EJS 

// Page d'accueil → on envoie la page de login (frontend/index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// 1) Liste des films
app.get("/films-ejs", async (req, res) => {
  try {
    const movies = await Movie.findAll({
      order: [["title", "ASC"]],
    });

    res.render("films", {
      movies,
      activePage: "films",       // <-- important
    });
  } catch (error) {
    console.error("Erreur /films-ejs :", error);
    res.status(500).send("Erreur serveur");
  }
});

// 2) Détail d'un film
app.get("/films-ejs/:id", async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);

    if (!movie) {
      return res.status(404).render("film-details", {
        movie: null,
        activePage: "films",
      });
    }

    res.render("film-details", {
      movie,
      activePage: "films",
    });
  } catch (error) {
    console.error("Erreur /films-ejs/:id :", error);
    res.status(500).send("Erreur serveur");
  }
});

// 3) Séances d'un film (showtimes)
app.get("/films-ejs/:id/showtimes", async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);

    if (!movie) {
      return res.status(404).render("showtimes", {
        movie: null,
        showtimes: [],
        activePage: "films",
      });
    }

    const showtimes = await Showtime.findAll({
      where: { movie_id: movie.id },
      include: [Room],
      order: [["start_time", "ASC"]],
    });

    res.render("showtimes", {
      movie,
      showtimes,
      activePage: "films",
    });
  } catch (error) {
    console.error("Erreur /films-ejs/:id/showtimes :", error);
    res.status(500).send("Erreur serveur");
  }
});

// 4) Page "Mes réservations" (EJS)
app.get("/reservations-ejs", async (req, res) => {
  try {
    let { userId, username } = req.query;

    // Si on a seulement le username (cas normal), on retrouve l'id
    if (!userId && username) {
      const userByName = await User.findOne({ where: { username } });
      if (userByName) {
        userId = userByName.id;
      }
    }

    if (!userId) {
      // Aucun user fourni => page d'explication
      return res.status(400).render("reservations-no-user");
    }

    const id = parseInt(userId, 10);
    if (Number.isNaN(id)) {
      return res.status(400).render("reservations-no-user");
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).render("reservations-no-user");
    }

    const bookings = await Booking.findAll({
      where: { user_id: id },
      include: [
        {
          model: Showtime,
          include: [Movie, Room],
        },
      ],
      order: [["booking_time", "DESC"]],
    });

    res.render("reservations", {
      user,
      bookings,
    });
  } catch (error) {
    console.error("Erreur /reservations-ejs :", error);
    res.status(500).send("Erreur serveur");
  }
});

// PAGES ADMIN EJS (AJOUT FILM + SEANCE)

app.get("/admin/movies/new", (req, res) => {
  res.render("admin-new-movie", {
    activePage: "admin",
  });
});

app.post("/admin/movies", async (req, res) => {
  try {
    const { title, description, rating, duration_minutes, release_date } = req.body;

    await Movie.create({
      title,
      description,
      rating,
      duration_minutes: duration_minutes || null,
      release_date: release_date || null,
    });

    res.redirect("/films-ejs");
  } catch (error) {
    console.error("Erreur POST /admin/movies :", error);
    res.status(500).send("Erreur lors de la création du film");
  }
});

app.get("/admin/showtimes/new", async (req, res) => {
  try {
    const movies = await Movie.findAll({ order: [["title", "ASC"]] });
    const rooms = await Room.findAll({ order: [["name", "ASC"]] });

    res.render("admin-new-showtime", {
      movies,
      rooms,
      activePage: "admin",
    });
  } catch (error) {
    console.error("Erreur GET /admin/showtimes/new :", error);
    res.status(500).send("Erreur serveur");
  }
});

app.post("/admin/showtimes", async (req, res) => {
  try {
    const { movie_id, room_id, start_time, price } = req.body;

    const showtime = await Showtime.create({
      movie_id,
      room_id,
      start_time,
      price,
    });

    res.redirect(`/films-ejs/${showtime.movie_id}/showtimes`);
  } catch (error) {
    console.error("Erreur POST /admin/showtimes :", error);
    res.status(500).send("Erreur lors de la création de la séance");
  }
});

// Formulaire ajout de séance
app.get("/admin/showtimes/new", async (req, res) => {
  try {
    const movies = await Movie.findAll({ order: [["title", "ASC"]] });
    const rooms = await Room.findAll({ order: [["name", "ASC"]] });

    res.render("admin-new-showtime", { movies, rooms });
  } catch (error) {
    console.error("Erreur GET /admin/showtimes/new :", error);
    res.status(500).send("Erreur serveur");
  }
});

app.post("/admin/showtimes", async (req, res) => {
  try {
    const { movie_id, room_id, start_time, price } = req.body;

    const showtime = await Showtime.create({
      movie_id,
      room_id,
      start_time,
      price,
    });

    res.redirect(`/films-ejs/${showtime.movie_id}/showtimes`);
  } catch (error) {
    console.error("Erreur POST /admin/showtimes :", error);
    res.status(500).send("Erreur lors de la création de la séance");
  }
});

// API JSON 

app.get("/api", (req, res) => {
  res.json({ message: "Cinema reservation API is running..." });
});

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/showtimes", showtimeRoutes);
app.use("/api/bookings", bookingRoutes);

// LANCEMENT SERVEU

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
