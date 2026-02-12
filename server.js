// server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import sequelize, { connectDB } from "./config/connection.js";
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
// 4) Page "Mes réservations" (EJS)
app.get("/reservations-ejs", async (req, res) => {
  try {
    const { username, userId } = req.query;

    let user = null;

    // 1) Si on a un username dans l'URL → priorité
    if (username && username.trim()) {
      user = await User.findOne({
        where: { username: username.trim() },
      });
    }
    // 2) Sinon, si on a un userId → fallback
    else if (userId) {
      const idNum = parseInt(userId, 10);
      if (!Number.isNaN(idNum)) {
        user = await User.findByPk(idNum);
      }
    }

    // Aucun utilisateur trouvé → page d'info (pas d'erreur rouge)
    if (!user) {
      return res.status(200).render("reservations-no-user", {
        activePage: "reservations",
      });
    }

    const bookings = await Booking.findAll({
      where: { user_id: user.id },
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

// --------- ADMIN : ÉDITION FILM ---------
app.get("/admin/movies/:id/edit", async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) {
      return res.status(404).send("Film introuvable");
    }

    res.render("admin-edit-movie", {
      movie,
      error: null,
      activePage: "admin",
    });
  } catch (error) {
    console.error("Erreur GET /admin/movies/:id/edit :", error);
    res.status(500).send("Erreur serveur");
  }
});

app.post("/admin/movies/:id", async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) {
      return res.status(404).send("Film introuvable");
    }

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
      return res.status(400).render("admin-edit-movie", {
        movie: { ...movie.toJSON(), ...old },
        error: errors.join(" "),
        activePage: "admin",
      });
    }

    await movie.update({
      title: title.trim(),
      description: description || null,
      rating: rating || null,
      duration_minutes: duration_minutes || null,
      release_date: release_date || null,
      poster_url: poster_url || null,
    });

    res.redirect("/films-ejs");
  } catch (error) {
    console.error("Erreur POST /admin/movies/:id :", error);
    res.status(500).render("admin-edit-movie", {
      movie: { id: req.params.id, ...req.body },
      error: "Erreur lors de la mise à jour du film.",
      activePage: "admin",
    });
  }
});

// --------- ADMIN : ÉDITION SÉANCE ---------
app.get("/admin/showtimes/:id/edit", async (req, res) => {
  try {
    const showtime = await Showtime.findByPk(req.params.id);
    if (!showtime) {
      return res.status(404).send("Séance introuvable");
    }

    const movies = await Movie.findAll({ order: [["title", "ASC"]] });
    const rooms = await Room.findAll({ order: [["name", "ASC"]] });

    res.render("admin-edit-showtime", {
      showtime,
      movies,
      rooms,
      error: null,
      activePage: "admin",
    });
  } catch (error) {
    console.error("Erreur GET /admin/showtimes/:id/edit :", error);
    res.status(500).send("Erreur serveur");
  }
});

app.post("/admin/showtimes/:id", async (req, res) => {
  try {
    const showtime = await Showtime.findByPk(req.params.id);
    if (!showtime) {
      return res.status(404).send("Séance introuvable");
    }

    const { movie_id, room_id, start_time, price } = req.body;
    const errors = [];

    if (!movie_id) errors.push("Le film est obligatoire.");
    if (!room_id) errors.push("La salle est obligatoire.");
    if (!start_time) errors.push("La date/heure de la séance est obligatoire.");
    if (price && Number.isNaN(Number(price))) {
      errors.push("Le prix doit être un nombre.");
    }

    if (errors.length > 0) {
      const movies = await Movie.findAll({ order: [["title", "ASC"]] });
      const rooms = await Room.findAll({ order: [["name", "ASC"]] });

      return res.status(400).render("admin-edit-showtime", {
        showtime: { ...showtime.toJSON(), movie_id, room_id, start_time, price },
        movies,
        rooms,
        error: errors.join(" "),
        activePage: "admin",
      });
    }

    await showtime.update({
      movie_id,
      room_id,
      start_time,
      price,
    });

    res.redirect(`/films-ejs/${showtime.movie_id}/showtimes`);
  } catch (error) {
    console.error("Erreur POST /admin/showtimes/:id :", error);
    res.status(500).send("Erreur lors de la mise à jour de la séance");
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
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();

    // crée/ajuste les tables automatiquement
    await sequelize.sync({ alter: true });
    console.log("✅ DB sync done (tables créées/ajustées)");

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
}

start();