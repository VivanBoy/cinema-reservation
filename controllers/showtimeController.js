import { Showtime, Movie, Room } from "../models/index.js";

export const createShowtime = async (req, res) => {
  try {
    const { movie_id, room_id, start_time, price } = req.body;

    if (!movie_id || !room_id || !start_time || !price) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }

    const showtime = await Showtime.create({
      movie_id,
      room_id,
      start_time,
      price,
    });

    res.status(201).json(showtime);
  } catch (error) {
    console.error("createShowtime error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getShowtimes = async (req, res) => {
  try {
    const showtimes = await Showtime.findAll({
      include: [
        { model: Movie, attributes: ["title"] },
        { model: Room, attributes: ["name"] },
      ],
    });
    res.json(showtimes);
  } catch (error) {
    console.error("getShowtimes error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};