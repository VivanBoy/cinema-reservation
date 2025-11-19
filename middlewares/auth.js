import jwt from "jsonwebtoken";

const JWT_SECRET = "supersecretkey";

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant ou invalide" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // { id, username, roles }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide" });
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.roles?.includes("admin")) {
    return res.status(403).json({ message: "Accès réservé aux administrateurs" });
  }
  next();
};
