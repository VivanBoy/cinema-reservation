// frontend/js/movies.js
import { apiFetch } from "./api.js";

const moviesContainer = document.getElementById("movies-container");

const addMovieForm = document.getElementById("add-movie-form");
const addMovieMessage = document.getElementById("add-movie-message");

const showtimeSection = document.getElementById("showtime-section");
const addShowtimeForm = document.getElementById("add-showtime-form");
const addShowtimeMessage = document.getElementById("add-showtime-message");
const showtimeMovieSelect = document.getElementById("showtime-movie");
const showtimeRoomSelect = document.getElementById("showtime-room");

// --------- FILMS ---------
export async function loadMovies() {
  if (!moviesContainer) return;

  moviesContainer.innerHTML = "<p>Chargement des films...</p>";

  try {
    const movies = await apiFetch("/api/movies");

    if (!movies || movies.length === 0) {
      moviesContainer.innerHTML = "<p>Aucun film disponible.</p>";
      return;
    }

    moviesContainer.innerHTML = "";

    movies.forEach((movie) => {
      const col = document.createElement("div");
      col.className = "col-md-6";

      const card = document.createElement("div");
      card.className = "card shadow-sm mb-3";

      const body = document.createElement("div");
      body.className = "card-body";

      const title = document.createElement("h5");
      title.className = "card-title";
      title.textContent = movie.title;

      const desc = document.createElement("p");
      desc.className = "card-text";
      desc.textContent = movie.description || "Pas de description.";

      const info = document.createElement("p");
      info.className = "card-text";
      info.innerHTML = `
        <small class="text-muted">
          Durée : ${movie.duration_minutes || "?"} min<br/>
          Rating : ${movie.rating || "N/A"}
        </small>
      `;

      const showtimesBtn = document.createElement("button");
      showtimesBtn.className = "btn btn-outline-primary btn-sm mt-2";
      showtimesBtn.textContent = "Voir les séances";
      showtimesBtn.onclick = () => loadShowtimesForMovie(movie.id);

      const showtimesDiv = document.createElement("div");
      showtimesDiv.className = "mt-3";
      showtimesDiv.id = `showtimes-${movie.id}`;

      body.appendChild(title);
      body.appendChild(desc);
      body.appendChild(info);
      body.appendChild(showtimesBtn);
      body.appendChild(showtimesDiv);

      card.appendChild(body);
      col.appendChild(card);
      moviesContainer.appendChild(col);
    });
  } catch (err) {
    console.error("Erreur loadMovies:", err);
    moviesContainer.innerHTML =
      "<p class='text-danger'>Erreur lors du chargement des films.</p>";
  }
}

// --------- SÉANCES POUR UN FILM ---------
async function loadShowtimesForMovie(movieId) {
  const container = document.getElementById(`showtimes-${movieId}`);
  if (!container) return;

  container.innerHTML = "<p>Chargement des séances...</p>";

  try {
    const allShowtimes = await apiFetch("/api/showtimes");
    const showtimes = allShowtimes.filter(
      (st) => st.movie_id === movieId || st.movie_id === Number(movieId)
    );

    if (!showtimes || showtimes.length === 0) {
      container.innerHTML = "<p>Aucune séance disponible pour ce film.</p>";
      return;
    }

    container.innerHTML = "";

    showtimes.forEach((st) => {
      const item = document.createElement("div");
      item.className = "border rounded p-2 mb-2";

      const start = new Date(st.start_time);

      const roomName =
        st.Room?.name || st.room?.name || `Salle #${st.room_id || "?"}`;

      item.innerHTML = `
        <strong>📅 ${start.toLocaleString()}</strong><br/>
        🎥 ${roomName}<br/>
        💲 ${st.price} $
      `;

      const btn = document.createElement("button");
      btn.className = "btn btn-success btn-sm mt-2";
      btn.textContent = "Réserver";
      btn.onclick = () => createBooking(st.id);

      item.appendChild(document.createElement("br"));
      item.appendChild(btn);

      container.appendChild(item);
    });
  } catch (err) {
    console.error("Erreur loadShowtimesForMovie:", err);
    container.innerHTML =
      "<p class='text-danger'>Erreur lors du chargement des séances.</p>";
  }
}

// --------- CRÉATION RÉSERVATION ---------
async function createBooking(showtimeId) {
  try {
    await apiFetch("/api/bookings", {
      method: "POST",
      body: JSON.stringify({ showtime_id: showtimeId }),
    });

    alert("Réservation effectuée avec succès ✅");
  } catch (err) {
    console.error("Erreur createBooking:", err);
    alert(
      err?.data?.message || "Erreur lors de la réservation. Êtes-vous connecté ?"
    );
  }
}

// --------- FORMULAIRE AJOUT FILM (ADMIN) ---------
if (addMovieForm) {
  addMovieForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (addMovieMessage) {
      addMovieMessage.textContent = "";
      addMovieMessage.className = "mt-2";
    }

    const title = document.getElementById("movie-title").value.trim();
    const description = document
      .getElementById("movie-description")
      .value.trim();
    const rating = document.getElementById("movie-rating").value.trim();
    const duration = parseInt(
      document.getElementById("movie-duration").value,
      10
    );
    const releaseDate = document.getElementById("movie-release-date").value;

    if (!title || !duration) {
      if (addMovieMessage) {
        addMovieMessage.textContent =
          "Titre et durée (minutes) sont obligatoires.";
        addMovieMessage.className = "mt-2 text-danger";
      }
      return;
    }

    try {
      await apiFetch("/api/movies", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          rating,
          duration_minutes: duration,
          release_date: releaseDate || null,
        }),
      });

      if (addMovieMessage) {
        addMovieMessage.textContent = "Film ajouté avec succès ✅";
        addMovieMessage.className = "mt-2 text-success";
      }
      addMovieForm.reset();
      await loadMovies();
    } catch (err) {
      console.error("Erreur addMovie:", err);
      if (addMovieMessage) {
        addMovieMessage.textContent =
          err?.data?.message || "Erreur lors de l'ajout du film.";
        addMovieMessage.className = "mt-2 text-danger";
      }
    }
  });
}

// --------- ADMIN : CHARGER LISTES FILMS & SALLES ---------
export async function loadShowtimeAdmin() {
  if (
    !showtimeSection ||
    !addShowtimeForm ||
    !showtimeMovieSelect ||
    !showtimeRoomSelect
  ) {
    return;
  }

  try {
    const movies = await apiFetch("/api/movies");
    showtimeMovieSelect.innerHTML = movies
      .map((m) => `<option value="${m.id}">${m.title}</option>`)
      .join("");

    const rooms = await apiFetch("/api/rooms");
    showtimeRoomSelect.innerHTML = rooms
      .map(
        (r) =>
          `<option value="${r.id}">${r.name} (${r.capacity} places)</option>`
      )
      .join("");
  } catch (err) {
    console.error("Erreur loadShowtimeAdmin:", err);
  }
}

// --------- ADMIN : CRÉATION SÉANCE ---------
if (addShowtimeForm) {
  addShowtimeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (addShowtimeMessage) {
      addShowtimeMessage.textContent = "";
      addShowtimeMessage.className = "mt-2";
    }

    const movie_id = showtimeMovieSelect.value;
    const room_id = showtimeRoomSelect.value;
    const start_time = document.getElementById("showtime-start").value;
    const price = parseFloat(
      document.getElementById("showtime-price").value
    );

    if (!movie_id || !room_id || !start_time || isNaN(price)) {
      if (addShowtimeMessage) {
        addShowtimeMessage.textContent = "Tous les champs sont requis.";
        addShowtimeMessage.className = "mt-2 text-danger";
      }
      return;
    }

    try {
      await apiFetch("/api/showtimes", {
        method: "POST",
        body: JSON.stringify({
          movie_id,
          room_id,
          start_time,
          price,
        }),
      });

      if (addShowtimeMessage) {
        addShowtimeMessage.textContent = "Séance créée avec succès ✅";
        addShowtimeMessage.className = "mt-2 text-success";
      }
      addShowtimeForm.reset();
    } catch (err) {
      console.error("Erreur addShowtime:", err);
      if (addShowtimeMessage) {
        addShowtimeMessage.textContent =
          err?.data?.message || "Erreur lors de la création de la séance.";
        addShowtimeMessage.className = "mt-2 text-danger";
      }
    }
  });
}

// --------- CHARGEMENT INITIAL ---------
document.addEventListener("DOMContentLoaded", () => {
  loadMovies();
});