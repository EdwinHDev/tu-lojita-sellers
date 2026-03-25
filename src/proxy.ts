import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Comprobación rápida en el Edge de Next.js
  const hasAccessToken = request.cookies.has("access_token");
  
  // Lista de rutas que requieren autenticación
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith("/tienda") ||
    request.nextUrl.pathname.startsWith("/crear-tienda");

  if (isProtectedRoute && !hasAccessToken) {
    // Si no hay token de acceso (incluso si hay de refresh), redirigimos 
    // a la base para que no haya latencia visual ni flashazo de contenido. 
    // El refresh token operará de todos modos allí si fuera válido.
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Si el usuario ya está autenticado y trata de ir al login (/)
  if (request.nextUrl.pathname === "/" && hasAccessToken) {
    return NextResponse.redirect(new URL("/tienda", request.url));
  }

  // Rutas públicas o el usuario sí tiene tokens base para probar suerte
  return NextResponse.next();
}

// Optimizamos el Middleware para que no corra en estáticos ni imágenes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico).*)"],
};
