import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const Showtime = sequelize.define(
  "Showtime",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    movie_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
    },
  },
  {
    tableName: "showtimes",
    timestamps: false,
  }
);

export default Showtime;
