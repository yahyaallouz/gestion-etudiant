export const API_BASE_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost/GestionETD/backend/api"
    : window.location.origin + "/backend/api";
