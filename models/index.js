import User from "./User.js";
import Role from "./Role.js";
import UserRole from "./UserRole.js";
import Movie from "./Movie.js";
import Room from "./Room.js";
import Showtime from "./Showtime.js";
import Booking from "./Booking.js";
import Ticket from "./Ticket.js";

// Users ↔ Roles (Many-to-Many)
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: "user_id",
  otherKey: "role_id",
});
Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: "role_id",
  otherKey: "user_id",
});

// 1 Movie → N Showtimes
Movie.hasMany(Showtime, { foreignKey: "movie_id" });
Showtime.belongsTo(Movie, { foreignKey: "movie_id" });

// 1 Room → N Showtimes
Room.hasMany(Showtime, { foreignKey: "room_id" });
Showtime.belongsTo(Room, { foreignKey: "room_id" });

// 1 Showtime → N Bookings
Showtime.hasMany(Booking, { foreignKey: "showtime_id" });
Booking.belongsTo(Showtime, { foreignKey: "showtime_id" });

// 1 User → N Bookings
User.hasMany(Booking, { foreignKey: "user_id" });
Booking.belongsTo(User, { foreignKey: "user_id" });

// 1 Booking → N Tickets
Booking.hasMany(Ticket, { foreignKey: "booking_id" });
Ticket.belongsTo(Booking, { foreignKey: "booking_id" });

export {
  User,
  Role,
  UserRole,
  Movie,
  Room,
  Showtime,
  Booking,
  Ticket,
};
