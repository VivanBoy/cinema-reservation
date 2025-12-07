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

// ========== MIDDLEWARES ==========
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== EJS ==========
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ========== FICHIERS STATIQUES (FRONTEND) ==========
app.use(express.static(path.join(__dirname, "frontend")));

// ========== ROUTES PAGES HTML / EJS ==========

// Page d'accueil → page de login (frontend/index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// 1) Liste des films (avec pagination)
app.get("/films-ejs", async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = 3; // films par page
    const offset = (page - 1) * limit;

    const { rows: movies, count } = await Movie.findAndCountAll({
      order: [["title", "ASC"]],
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));

    res.render("films", {
      movies,
      page,
      totalPages,
      activePage: "films",
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
    const userId = parseInt(req.query.userId, 10);

    // Aucun userId → page d'explication (pas d'erreur rouge)
    if (!userId || Number.isNaN(userId)) {
      return res.status(200).render("reservations-no-user", {
        activePage: "reservations",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(200).render("reservations-no-user", {
        activePage: "reservations",
      });
    }

    const bookings = await Booking.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Showtime,
          include: [Movie, Room],
        },
      ],
      order: [["booking_time", "DESC"]],
    });

    res.render("reservations", {
      activePage: "reservations",
      user: {
        id: user.id,
        username: user.username,
      },
      bookings,
    });
  } catch (err) {
    console.error("Erreur GET /reservations-ejs :", err);
    res.status(500).send("Erreur serveur");
  }
});

// ========== PAGES ADMIN EJS (AJOUT FILM + SÉANCE) ==========

// Formulaire ajout de film (Admin)
app.get("/admin/movies/new", (req, res) => {
  res.render("admin-new-movie", {
    error: null,
    old: {},
    activePage: "admin",
  });
});

app.post("/admin/movies", async (req, res) => {
  try {
    const {
      title,
      description,
      rating,
      duration_minutes,
      release_date,
      poster_url,
    } = req.body;

    const old = {
      title,
      description,
      rating,
      duration_minutes,
      release_date,
      poster_url,
    };

    const errors = [];

    if (!title || !title.trim()) {
      errors.push("Le titre est obligatoire.");
    } else if (title.trim().length < 2) {
      errors.push("Le titre doit contenir au moins 2 caractères.");
    }

    if (duration_minutes) {
      const d = Number(duration_minutes);
      if (Number.isNaN(d) || d <= 0) {
        errors.push("La durée doit être un nombre positif.");
      }
    }

    if (rating && rating.length > 10) {
      errors.push(
        "La classification (rating) est trop longue (10 caractères max)."
      );
    }

    if (errors.length > 0) {
      return res.status(400).render("admin-new-movie", {
        error: errors.join(" "),
        old,
        activePage: "admin",
      });
    }

    await Movie.create({
      title: title.trim(),
      description: description || null,
      rating: rating || null,
      duration_minutes: duration_minutes || null,
      release_date: release_date || null,
      poster_url: poster_url || null,
    });

    res.redirect("/films-ejs");
  } catch (error) {
    console.error("Erreur POST /admin/movies :", error);
    res.status(500).render("admin-new-movie", {
      error: "Erreur lors de la création du film.",
      old: req.body,
      activePage: "admin",
    });
  }
});

// Formulaire ajout de séance (Admin)
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

// ========== API JSON ==========
app.get("/api", (req, res) => {
  res.json({ message: "Cinema reservation API is running..." });
});

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/showtimes", showtimeRoutes);
app.use("/api/bookings", bookingRoutes);

// ========== LANCEMENT SERVEUR ==========
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
