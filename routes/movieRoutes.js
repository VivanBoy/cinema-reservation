import express from "express";
import {
  createMovie,
  getMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
} from "../controllers/movieController.js";
import { authenticate, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Public : liste & détail
router.get("/", getMovies);
router.get("/:id", getMovieById);

// Admin : CRUD complet
router.post("/", authenticate, isAdmin, createMovie);
router.put("/:id", authenticate, isAdmin, updateMovie);
router.delete("/:id", authenticate, isAdmin, deleteMovie);

export default router;
