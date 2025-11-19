import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Role, UserRole } from "../models/index.js";

const JWT_SECRET = "supersecretkey"; // même clé que dans auth.js
const JWT_EXPIRES_IN = "1h";

// REGISTER (inscription)
export const register = async (req, res) => {
  try {
    const { first_name, last_name, email, username, password } = req.body;

    if (!first_name || !last_name || !email || !username || !password) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }

    // Vérifier si email ou username existe déjà
    const existingUser = await User.findOne({
      where: { username },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Nom d'utilisateur déjà utilisé" });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création du user
    const user = await User.create({
      first_name,
      last_name,
      email,
      username,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Assigner le rôle "client" par défaut
    const clientRole = await Role.findOne({ where: { name: "client" } });
    if (clientRole) {
      await UserRole.create({
        user_id: user.id,
        role_id: clientRole.id,
      });
    }

    return res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// LOGIN (connexion)
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis" });
    }

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    // Récupérer les rôles
    const roles = await user.getRoles();
    const roleNames = roles.map((r) => r.name);

    const payload = {
      id: user.id,
      username: user.username,
      roles: roleNames,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({
      message: "Connexion réussie",
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
