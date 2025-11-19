import express from "express";
import { createShowtime, getShowtimes } from "../controllers/showtimeController.js";
import { authenticate, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getShowtimes);
router.post("/", authenticate, isAdmin, createShowtime);

export default router;
