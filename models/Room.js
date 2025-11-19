import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const Room = sequelize.define(
  "Room",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "rooms",
    timestamps: false,
  }
);

export default Room;
