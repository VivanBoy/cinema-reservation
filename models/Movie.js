// models/Movie.js

import { DataTypes } from "sequelize";
// ⬇⬇⬇ import du *default* export
import sequelize from "../config/connection.js";

const Movie = sequelize.define(
  "Movie",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Classification : PG-13, G, etc.
    rating: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    // Durée en minutes
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // Date de sortie (AAAA-MM-JJ)
    release_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    // URL de l’affiche du film
    poster_url: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
  },
  {
    tableName: "movies",
    timestamps: true, // colonnes created_at / updated_at
    underscored: true, // noms de colonnes en snake_case
  }
);

export default Movie;