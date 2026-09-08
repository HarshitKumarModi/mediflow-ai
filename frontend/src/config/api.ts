const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const AI_BASE_URL =
  import.meta.env.VITE_AI_BASE_URL || "http://localhost:8000";

export { API_BASE_URL, AI_BASE_URL };