// frontend/js/reservations.js
import { apiFetch } from "./api.js";

export async function loadReservations() {
  const section = document.getElementById("reservations-section");
  const list = document.getElementById("reservations-list");

  if (!section || !list) return;

  section.classList.remove("d-none");
  list.innerHTML = "<p>Chargement...</p>";

  try {
    const bookings = await apiFetch("/api/bookings/me");

    if (!bookings || bookings.length === 0) {
      list.innerHTML = "<p>Aucune réservation.</p>";
      return;
    }

    list.innerHTML = "";

    bookings.forEach((bk) => {
      const st = bk.Showtime || bk.ShowTime || bk.showtime || {};
      const movie = st.Movie || st.movie || {};
      const room = st.Room || st.room || {};

      const filmTitle = movie.title || "(Film inconnu)";
      const salle = room.name || "Salle ?";
      const start = st.start_time
        ? new Date(st.start_time).toLocaleString()
        : "Date inconnue";
      const price = st.price ?? "N/A";

      const col = document.createElement("div");
      col.className = "col-md-6";

      col.innerHTML = `
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${filmTitle}</h5>
            <p class="card-text">
              📅 ${start}<br/>
              🎥 ${salle}<br/>
              💲 ${price} $
            </p>
          </div>
        </div>
      `;

      list.appendChild(col);
    });
  } catch (err) {
    console.error("Erreur loadReservations:", err);
    list.innerHTML =
      "<p class='text-danger'>Erreur lors du chargement des réservations.</p>";
  }
}