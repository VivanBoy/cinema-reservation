// frontend/js/auth.js
import { apiFetch, setToken, clearToken, getToken } from "./api.js";
// Ces imports peuvent encore servir si tu veux charger des données depuis la page d'accueil
// import { loadMovies, loadShowtimeAdmin } from "./movies.js";
// import { loadReservations } from "./reservations.js";

// Éléments du DOM (page d'accueil / index.html)
const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const userInfo = document.getElementById("user-info");
const logoutBtn = document.getElementById("logout-btn");
const adminSection = document.getElementById("admin-section");
const showtimeSection = document.getElementById("showtime-section");
const reservationsBtn = document.getElementById("reservations-btn");
const reservationsSection = document.getElementById("reservations-section");

/**
 * Construit un objet "cinemaUser" unifié à partir de la réponse du backend.
 * On essaie d'être robuste à différentes formes de réponse.
 */
function buildCinemaUserFromResponse(data, fallbackUsername) {
  if (!data || typeof data !== "object") {
    throw new Error("Réponse invalide du serveur.");
  }

  // Partie "user" potentielle dans la réponse
  const userData =
    data.user ||
    data.utilisateur ||
    data.data ||
    data; // dernier recours : on prend l'objet lui-même

  const rawId =
    userData.id ??
    userData.userId ??
    data.userId ??
    null;

  const id =
    rawId !== null && rawId !== undefined && !Number.isNaN(Number(rawId))
      ? Number(rawId)
      : null;

  const username =
    userData.username ??
    data.username ??
    fallbackUsername ??
    null;

  const rawRoles =
    userData.roles ??
    data.roles ??
    [];

  const roles = Array.isArray(rawRoles)
    ? rawRoles
    : typeof rawRoles === "string"
    ? [rawRoles]
    : [];

  const token =
    data.token ||
    data.accessToken ||
    data.jwt ||
    userData.token ||
    null;

  return {
    id,
    username,
    roles,
    token,
  };
}

/**
 * Sauvegarde l'utilisateur dans le localStorage
 * + quelques clés de secours pour compatibilité.
 */
function saveCinemaUser(cinemaUser) {
  if (!cinemaUser) return;

  localStorage.setItem("cinemaUser", JSON.stringify(cinemaUser));

  if (cinemaUser.username) {
    localStorage.setItem("username", cinemaUser.username);
  }
  if (cinemaUser.id != null) {
    localStorage.setItem("userId", String(cinemaUser.id));
  }
  if (cinemaUser.token) {
    localStorage.setItem("token", cinemaUser.token);
  }
}

/**
 * Lecture de l'utilisateur stocké (version locale pour la page d'accueil).
 * La navbar EJS a sa propre version de getStoredUser, mais la structure est la même.
 */
function getLocalCinemaUser() {
  try {
    const raw = localStorage.getItem("cinemaUser");
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object") return null;

    const rawId =
      obj.id ??
      obj.userId ??
      localStorage.getItem("userId") ??
      null;

    const id =
      rawId !== null && rawId !== undefined && !Number.isNaN(Number(rawId))
        ? Number(rawId)
        : null;

    return {
      ...obj,
      id,
    };
  } catch (e) {
    console.warn("Impossible de parser cinemaUser :", e);
    return null;
  }
}

/**
 * Met à jour l'interface de la page d'accueil en fonction de l'utilisateur.
 */
function updateUIForUser(user) {
  const isLoggedIn = !!user && !!user.username;

  if (loginForm) {
    loginForm.classList.toggle("d-none", isLoggedIn);
  }

  if (userInfo) {
    if (isLoggedIn) {
      userInfo.textContent = `Connecté : ${user.username}`;
      userInfo.classList.remove("d-none");
    } else {
      userInfo.textContent = "";
      userInfo.classList.add("d-none");
    }
  }

  if (logoutBtn) {
    logoutBtn.classList.toggle("d-none", !isLoggedIn);
  }

  // Affichage des sections admin uniquement pour ino1 ou rôle admin
  const roles = (user && user.roles) || [];
  const isAdmin =
    isLoggedIn &&
    (user.username === "ino1" ||
      roles.includes("admin") ||
      roles.includes("ROLE_ADMIN"));

  if (adminSection) {
    adminSection.classList.toggle("d-none", !isAdmin);
  }
  if (showtimeSection) {
    showtimeSection.classList.toggle("d-none", !isAdmin);
  }

  // Section réservations (si tu l'utilises sur la page d'accueil)
  if (reservationsSection) {
    reservationsSection.classList.toggle("d-none", !isLoggedIn);
  }
}

/**
 * Remet l'interface dans l'état "non connecté".
 */
function resetUI() {
  if (loginForm) {
    loginForm.classList.remove("d-none");
  }
  if (userInfo) {
    userInfo.textContent = "";
    userInfo.classList.add("d-none");
  }
  if (logoutBtn) {
    logoutBtn.classList.add("d-none");
  }
  if (adminSection) {
    adminSection.classList.add("d-none");
  }
  if (showtimeSection) {
    showtimeSection.classList.add("d-none");
  }
  if (reservationsSection) {
    reservationsSection.classList.add("d-none");
  }
}

/**
 * Gestion de la soumission du formulaire de login.
 */
async function handleLoginSubmit(event) {
  event.preventDefault();
  if (!loginForm) return;

  const formData = new FormData(loginForm);
  const username = (formData.get("username") || "").toString().trim();
  const password = (formData.get("password") || "").toString().trim();

  if (!username || !password) {
    if (loginMessage) {
      loginMessage.textContent = "Veuillez saisir un nom d'utilisateur et un mot de passe.";
      loginMessage.className = "text-danger";
    }
    return;
  }

  if (loginMessage) {
    loginMessage.textContent = "Connexion en cours...";
    loginMessage.className = "text-muted";
  }

  try {
    // apiFetch devrait préfixer avec /api → "/api/auth/login"
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const cinemaUser = buildCinemaUserFromResponse(data, username);

    if (!cinemaUser.token) {
      throw new Error("Jeton d'authentification manquant dans la réponse.");
    }

    saveCinemaUser(cinemaUser);
    setToken(cinemaUser.token);

    if (loginMessage) {
      loginMessage.textContent = "Connexion réussie !";
      loginMessage.className = "text-success";
    }

    updateUIForUser(cinemaUser);
  } catch (err) {
    console.error("Erreur lors de la connexion :", err);
    clearToken();

    if (loginMessage) {
      loginMessage.textContent =
        err && err.message
          ? err.message
          : "Échec de la connexion. Vérifiez vos identifiants.";
      loginMessage.className = "text-danger";
    }
  }
}

/**
 * Déconnexion globale (utilisée aussi par la navbar EJS via window.logout()).
 */
function performLogout() {
  clearToken();
  localStorage.removeItem("cinemaUser");
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("userId");

  resetUI();
  window.location.href = "/";
}

/**
 * Gestion du bouton de déconnexion sur la page d'accueil.
 */
function handleLogoutClick(event) {
  event.preventDefault();
  performLogout();
}

// Expose la fonction de logout pour les autres pages (navbar EJS, etc.)
window.logout = performLogout;

/**
 * Gestion du bouton "Voir mes réservations" sur la page d'accueil
 * (si présent).
 */
function setupReservationsButton() {
  if (!reservationsBtn) return;

  reservationsBtn.addEventListener("click", function (e) {
    e.preventDefault();
    const user = getLocalCinemaUser();

    if (!user || user.id == null) {
      alert("Veuillez vous connecter pour voir vos réservations.");
      return;
    }

    window.location.href =
      "/reservations-ejs?userId=" + encodeURIComponent(user.id);
  });
}

/**
 * Initialisation à chargement de la page.
 */
function initAuth() {
  const storedUser = getLocalCinemaUser();
  const token = getToken() || localStorage.getItem("token") || null;

  if (storedUser && token) {
    // On considère l'utilisateur déjà connecté
    updateUIForUser({
      ...storedUser,
      token,
    });
    setToken(token);
  } else {
    resetUI();
  }

  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  }
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogoutClick);
  }

  setupReservationsButton();
}

document.addEventListener("DOMContentLoaded", initAuth);