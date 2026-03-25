import Link from "next/link";
import { Home01Icon, AlertCircleIcon } from "hugeicons-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-24 text-center dark:bg-gray-950 sm:py-32 lg:px-8">
      <div className="relative">
        {/* Decoración de fondo difuminada */}
        <div className="absolute -inset-10 bg-indigo-500/20 blur-3xl rounded-full dark:bg-indigo-500/10 pointer-events-none" aria-hidden="true" />
        
        <div className="relative flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 mb-8 shadow-sm">
            <AlertCircleIcon size={32} strokeWidth={2} />
          </div>
          
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">Error 404</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Página no encontrada
          </h1>
          <p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-400 max-w-md">
            Lo sentimos, no pudimos encontrar la página que estás buscando. Es posible que el enlace esté roto o haya sido movido.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200 active:scale-95"
            >
              <Home01Icon size={18} strokeWidth={2} />
              Volver al inicio
            </Link>
            
            <Link
              href="/tienda"
              className="rounded-xl px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200"
            >
              Ir a mi Tienda
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer minimalista */}
      <footer className="absolute bottom-8 text-xs text-gray-400 dark:text-gray-600 font-medium tracking-tight">
        © {new Date().getFullYear()} Tu Lojita Inc. - Sellers Support
      </footer>
    </main>
  );
}
