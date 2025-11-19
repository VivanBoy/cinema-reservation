import express from "express";
import { register, login } from "../controllers/authController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// Exemple de route protégée pour tester le token
router.get("/me", authenticate, (req, res) => {
  res.json({ message: "Token valide", user: req.user });
});

export default router;
