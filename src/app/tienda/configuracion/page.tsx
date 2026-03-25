"use client";

import { Settings02Icon, Store01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";

export default function ConfiguracionPage() {
  const sections = [
    {
      title: "Información General",
      description: "Administra el nombre, logo y descripción de tu tienda.",
      icon: Store01Icon,
    },
    {
      title: "Seguridad y Accesos",
      description: "Revisa los métodos de inicio de sesión y claves API.",
      icon: Settings02Icon,
    },
    {
      title: "Personalización",
      description: "Cambia los colores y el estilo de tu tienda.",
      icon: Settings02Icon,
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {sections.map((section) => (
          <div key={section.title} className="rounded-xl border border-gray-100 dark:border-gray-800 p-6 bg-white dark:bg-gray-900 hover:border-indigo-600/30 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                <section.icon size={24} className="text-gray-500 group-hover:text-indigo-600 transition-colors" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold leading-none">{section.title}</h3>
                <p className="text-sm text-gray-500">{section.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">Guardar Cambios</Button>
      </div>
    </div>
  );
}
