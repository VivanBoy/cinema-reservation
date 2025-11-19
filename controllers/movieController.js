import { Movie } from "../models/index.js";

export const createMovie = async (req, res) => {
  try {
    const { title, description, rating, duration_minutes, release_date } = req.body;

    if (!title || !duration_minutes) {
      return res.status(400).json({ message: "title et duration_minutes sont obligatoires" });
    }

    const movie = await Movie.create({
      title,
      description,
      rating,
      duration_minutes,
      release_date,
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(201).json(movie);
  } catch (error) {
    console.error("createMovie error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getMovies = async (req, res) => {
  try {
    const movies = await Movie.findAll();
    res.json(movies);
  } catch (error) {
    console.error("getMovies error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ message: "Film non trouvé" });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ message: "Film non trouvé" });

    await movie.update({ ...req.body, updated_at: new Date() });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ message: "Film non trouvé" });

    await movie.destroy();
    res.json({ message: "Film supprimé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};