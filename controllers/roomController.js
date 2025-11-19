import { Room } from "../models/index.js";

export const createRoom = async (req, res) => {
  try {
    const { name, capacity } = req.body;
    if (!name || !capacity) {
      return res.status(400).json({ message: "name et capacity sont obligatoires" });
    }

    const room = await Room.create({ name, capacity });
    res.status(201).json(room);
  } catch (error) {
    console.error("createRoom error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};
