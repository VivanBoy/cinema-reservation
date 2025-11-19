import express from "express";
import cors from "cors";

import { connectDB } from "./config/connection.js";
import "./models/index.js";
import authRoutes from "./routes/authRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import showtimeRoutes from "./routes/showtimeRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
const app = express();

app.use(cors());
app.use(express.json());

// Route test
app.get("/", (req, res) => {
  res.json({ message: "Cinema reservation API is running..." });
});

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/showtimes", showtimeRoutes);
app.use("/api/bookings", bookingRoutes);

// Connexion DB
connectDB();

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
