// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: userId }
    next();
  } catch (error) {
    console.error("Erreur authMiddleware:", error);
    return res.status(401).json({ message: "Token invalide" });
  }
}