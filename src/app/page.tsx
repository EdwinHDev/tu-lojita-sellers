import Image from "next/image";
import Link from "next/link";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { ThemeProvider } from "@/components/theme-provider";

export default function Home() {
  return (
    <ThemeProvider forcedTheme="light">
      <main className="relative flex h-dvh w-dvw flex-col bg-[url(/images/bg_login.jpg)] bg-cover bg-center selection:bg-indigo-500/30 overflow-x-hidden">
        {/* Overlay con degradado premium */}
        <div
          className="absolute inset-0 bg-linear-to-r from-black/95 via-black/80 sm:via-black/70 to-black/40 sm:to-black/10 pointer-events-none"
          aria-hidden="true"
        />

        {/* Contenedor principal alineado a la izquierda */}
        <div className="relative z-10 flex h-full w-full flex-col justify-between p-6 sm:p-10 md:px-16 md:py-12 overflow-y-auto">

          {/* Header - Logo */}
          <header className="w-fit shrink-0">
            <Link href="/">
              <Image
                src="/images/tu-lojita.svg"
                alt="Tu Lojita Sellers Logo"
                width={160}
                height={47}
                className="w-28 sm:w-32 md:w-40 drop-shadow-md transition-transform hover:scale-105 duration-300"
                priority
              />
            </Link>
          </header>

          {/* Main Content */}
          <div className="flex flex-col gap-6 sm:gap-8 md:gap-12 my-auto max-w-2xl py-10 sm:py-0">
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-white leading-[1.15] drop-shadow-sm">
                Vende lo que quieras, <br className="hidden md:block" />
                <span className="bg-linear-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">cuando quieras</span> <br className="hidden md:block" />
                y donde quieras.
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-xl leading-relaxed">
                Administra tu inventario, analiza tus ventas y haz crecer tu negocio digital con la plataforma más avanzada para vendedores.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 w-full">
              <GoogleLoginButton />

              <div className="text-xs sm:text-sm font-medium text-gray-400/80 hidden sm:flex items-center gap-2">
                <span className="block w-4 h-px bg-gray-600"></span>
                Rápido y seguro
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-white/10 pt-6 mt-auto shrink-0">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between text-xs sm:text-sm text-gray-400 font-medium text-center sm:text-left">
              <p>© {new Date().getFullYear()} Tu Lojita Inc. Todos los derechos reservados.</p>
              <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
                <Link href="#" className="hover:text-white transition-colors duration-200">
                  Términos
                </Link>
                <Link href="#" className="hover:text-white transition-colors duration-200">
                  Privacidad
                </Link>
                <Link href="#" className="hover:text-white transition-colors duration-200">
                  Soporte
                </Link>
              </div>
            </div>
          </footer>

        </div>
      </main>
    </ThemeProvider>
  );
}

