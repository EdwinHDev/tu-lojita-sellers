import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4500/api/v1";

export const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Variables para manejar la concurrencia de refresco
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Request Interceptor:
 * Inyecta el Access Token leyendo desde las Cookies seguras.
 */
axiosClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined" && !config.url?.includes("/auth/google")) {
      const token = Cookies.get("access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor:
 * Captura 401s, hace fetch al Refresh Token y reintenta.
 */
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el servidor responde 401, el request no es un reintento y no es endpoint de auth
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/google") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        // Encolar las peticiones si ya hay un refresh en curso
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = Cookies.get("refresh_token");

        // Cortocircuito si no tenemos refresh token guardado
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // 🛡️ REGLA CRÍTICA: El backend espera un GET con el Refresh Token en el header de Authorization
        const response = await axios.get(`${API_URL}/auth/refresh`, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        const newAccessToken = response.data?.accessToken || response.data?.access_token || response.data?.token;
        const newRefreshToken = response.data?.refreshToken || response.data?.refresh_token;

        if (!newAccessToken) {
          throw new Error("Invalid refresh backend response");
        }

        // Actualizamos Cookies con path explícito para evitar duplicidad de cookies por ruta
        const cookieOptions: Cookies.CookieAttributes = {
          secure: process.env.NODE_ENV === "production",
          sameSite: "Lax",
          path: "/"
        };

        Cookies.set("access_token", newAccessToken, cookieOptions);
        if (newRefreshToken) {
          Cookies.set("refresh_token", newRefreshToken, cookieOptions);
        }

        // Desbloqueamos el flag ANTES de procesar la cola
        isRefreshing = false;

        // Procesamos la cola retenida
        axiosClient.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        // Reintentamos la petición original automáticamente
        return axiosClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false; // Liberar también en error
        processQueue(refreshError, null);

        // El refresh falló completamente. Limpiar todo y botar al login.
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");

        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
