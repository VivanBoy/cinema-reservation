import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const Ticket = sequelize.define(
  "Ticket",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    seat_number: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
    },
    qr_code: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "tickets",
    timestamps: false,
  }
);

export default Ticket;