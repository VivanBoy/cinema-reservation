import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const Movie = sequelize.define(
  "Movie",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rating: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    release_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "movies",
    timestamps: false,
  }
);

export default Movie;
