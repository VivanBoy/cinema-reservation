// frontend/js/auth.js
import { apiFetch, setToken, clearToken, getToken } from "./api.js";
import { loadMovies, loadShowtimeAdmin } from "./movies.js";
import { loadReservations } from "./reservations.js";

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const userInfo = document.getElementById("user-info");
const logoutBtn = document.getElementById("logout-btn");
const adminSection = document.getElementById("admin-section");
const showtimeSection = document.getElementById("showtime-section");
const reservationsBtn = document.getElementById("reservations-btn");
const reservationsSection = document.getElementById("reservations-section");

async function fetchMe() {
  try {
    const data = await apiFetch("/api/auth/me");

    const roles = data.user.roles || [];
    userInfo.textContent = `Connecté : ${data.user.username} (${roles.join(", ")})`;
    logoutBtn.classList.remove("d-none");

    // Admin -> sections admin visibles
    if (roles.includes("admin")) {
      adminSection?.classList.remove("d-none");
      showtimeSection?.classList.remove("d-none");
      await loadShowtimeAdmin();
    } else {
      adminSection?.classList.add("d-none");
      showtimeSection?.classList.add("d-none");
    }

    // Client ou admin -> bouton Mes réservations
    if (roles.includes("client") || roles.includes("admin")) {
      reservationsBtn?.classList.remove("d-none");
    } else {
      reservationsBtn?.classList.add("d-none");
      reservationsSection?.classList.add("d-none");
    }
  } catch (err) {
    console.error("Erreur fetchMe:", err);
    userInfo.textContent = "";
    logoutBtn.classList.add("d-none");
    adminSection?.classList.add("d-none");
    showtimeSection?.classList.add("d-none");
    reservationsBtn?.classList.add("d-none");
    reservationsSection?.classList.add("d-none");
  }
}

// LOGIN
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginMessage.textContent = "";
    loginMessage.className = "mt-2";

    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!username || !password) {
      loginMessage.textContent =
        "Nom d'utilisateur et mot de passe sont requis.";
      loginMessage.classList.add("text-danger");
      return;
    }

    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      setToken(data.token);
      loginMessage.textContent = "Connexion réussie ";
      loginMessage.classList.remove("text-danger");
      loginMessage.classList.add("text-success");

      await fetchMe();
      await loadMovies();
    } catch (err) {
      console.error("Erreur login:", err);
      loginMessage.textContent =
        err?.data?.message || "Erreur lors de la connexion.";
      loginMessage.classList.remove("text-success");
      loginMessage.classList.add("text-danger");
    }
  });
}

// LOGOUT
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    clearToken();
    userInfo.textContent = "";
    logoutBtn.classList.add("d-none");
    adminSection?.classList.add("d-none");
    showtimeSection?.classList.add("d-none");
    reservationsBtn?.classList.add("d-none");
    reservationsSection?.classList.add("d-none");
    loginMessage.textContent = "";
  });
}

// BOUTON MES RÉSERVATIONS
if (reservationsBtn) {
  reservationsBtn.addEventListener("click", async () => {
    await loadReservations();
  });
}

// Au chargement de la page
document.addEventListener("DOMContentLoaded", async () => {
  await loadMovies();
  if (getToken()) {
    await fetchMe();
  }
});