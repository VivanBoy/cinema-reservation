import { Sequelize } from "sequelize";

// EST : connexion en dur, sans .env
const sequelize = new Sequelize(
  "cinema_reservation", // nom de ta BD
  "root",               // utilisateur
  "200408",             // TON mot de passe MySQL
  {
    host: "localhost",
    port: 3306,
    dialect: "mysql",
    logging: false,
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully from Node!");
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
  }
};

export default sequelize;