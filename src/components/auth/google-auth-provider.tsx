"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  // Obtenemos el client ID de las variables de entorno
  // Asegúrate de que no esté vacío para que el provider no arroje errores en runtime
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "AQUI_VA_TU_CLIENT_ID_DE_GOOGLE";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
