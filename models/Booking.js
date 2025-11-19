import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const Booking = sequelize.define(
  "Booking",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    showtime_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "paid", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
    booking_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "bookings",
    timestamps: false,
  }
);

export default Booking;