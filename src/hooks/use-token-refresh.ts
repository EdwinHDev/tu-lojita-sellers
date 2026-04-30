"use client";

import { useEffect, useRef } from "react";
import Cookies from "js-cookie";

const REFRESH_INTERVAL = 14 * 60 * 1000;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4500/api/v1";

export function useTokenRefresh() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const refreshToken = async () => {
      try {
        const refresh = Cookies.get("refresh_token");
        
        if (!refresh) {
          return;
        }

        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${refresh}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to refresh token");
        }

        const data = await response.json();
        const newAccessToken = data?.accessToken || data?.access_token;
        const newRefreshToken = data?.refreshToken || data?.refresh_token;

        if (!newAccessToken) {
          throw new Error("Invalid refresh response");
        }

        const cookieOptions: Cookies.CookieAttributes = {
          secure: process.env.NODE_ENV === "production",
          sameSite: "Lax",
          path: "/",
        };

        Cookies.set("access_token", newAccessToken, cookieOptions);
        if (newRefreshToken) {
          Cookies.set("refresh_token", newRefreshToken, cookieOptions);
        }

      } catch (error) {
        console.error("[Token Refresh] Auto-refresh failed:", error);
      }
    };

    refreshToken();

    intervalRef.current = setInterval(refreshToken, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
}
