// backend/routes/bookingRoutes.js
import express from "express";
import {
  createBooking,
  getMyBookings,
} from "../controllers/bookingController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { Booking } from "../models/index.js";

const router = express.Router();

// Créer une réservation (client connecté)
router.post("/", authenticate, createBooking);

// Récupérer mes réservations (JSON, si tu l'utilises quelque part)
router.get("/me", authenticate, getMyBookings);

// Annuler une réservation (client connecté ou admin)
// Appelé par le bouton "Annuler la réservation" dans reservations.ejs
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    if (Number.isNaN(bookingId)) {
      return res.status(400).json({ error: "ID de réservation invalide." });
    }

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Réservation introuvable." });
    }

    // Récupérer l'utilisateur courant depuis le middleware d'authentification
    const userFromReq = req.user || {};
    const currentUserId =
      userFromReq.id ??
      userFromReq.userId ??
      req.userId ??
      null;
    const currentUsername = userFromReq.username || null;
    const roles = userFromReq.roles || [];

    const isOwner =
      currentUserId != null &&
      Number(booking.user_id) === Number(currentUserId);

    const isAdmin =
      currentUsername === "ino1" ||
      roles.includes("admin") ||
      roles.includes("ROLE_ADMIN");

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: "Vous n'êtes pas autorisé à annuler cette réservation.",
      });
    }

    // Ici on supprime complètement la réservation.
    // Si tu préfères, tu peux plutôt faire : booking.status = "cancelled"; await booking.save();
    await booking.destroy();

    return res.json({ message: "Réservation annulée avec succès." });
  } catch (err) {
    console.error("Erreur DELETE /api/bookings/:id :", err);
    return res.status(500).json({
      error: "Erreur serveur lors de l'annulation de la réservation.",
    });
  }
});

export default router;
