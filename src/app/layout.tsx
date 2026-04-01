import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Roboto } from "next/font/google";
import { GoogleAuthProvider } from "@/components/auth/google-auth-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Tu Lojita para Vendedores",
  description: "Plataforma para vendedores de Tu Lojita",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${roboto.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <GoogleAuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </ThemeProvider>
          </GoogleAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
