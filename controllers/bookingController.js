// backend/controllers/bookingController.js
import Booking from "../models/Booking.js";
import Showtime from "../models/Showtime.js";
import Movie from "../models/Movie.js";
import Room from "../models/Room.js";

export async function createBooking(req, res) {
  try {
    const userId = req.user.id;
    const { showtime_id } = req.body;

    if (!showtime_id) {
      return res.status(400).json({ message: "showtime_id est requis" });
    }

    const showtime = await Showtime.findByPk(showtime_id);
    if (!showtime) {
      return res.status(404).json({ message: "Séance introuvable" });
    }

    const booking = await Booking.create({
      user_id: userId,
      showtime_id,
      booking_time: new Date(),
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error("Erreur createBooking:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de la réservation" });
  }
}

export async function getMyBookings(req, res) {
  try {
    const userId = req.user.id;

    const bookings = await Booking.findAll({
      where: { user_id: userId },
      order: [["booking_time", "DESC"]],
      include: [
        {
          model: Showtime,
          include: [Movie, Room],
        },
      ],
    });

    res.json(bookings);
  } catch (error) {
    console.error("Erreur getMyBookings:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des réservations" });
  }
}