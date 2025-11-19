import express from "express";
import { createRoom, getRooms } from "../controllers/roomController.js";
import { authenticate, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getRooms);
router.post("/", authenticate, isAdmin, createRoom);

export default router;
