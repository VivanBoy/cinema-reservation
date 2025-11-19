// backend/routes/bookingRoutes.js
import express from "express";
import { createBooking, getMyBookings } from "../controllers/bookingController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Créer une réservation (client connecté)
router.post("/", authenticate, createBooking);

// Récupérer mes réservations
router.get("/me", authenticate, getMyBookings);

export default router;