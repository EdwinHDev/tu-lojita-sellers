"use client";

import { Invoice01Icon, Download01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";

export default function VentasPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Ventas</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="border-gray-200 dark:border-gray-800">
            <Download01Icon className="mr-2 h-4 w-4" />
            Exportar Historial
          </Button>
        </div>
      </div>

      <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed border-gray-200 dark:border-gray-800">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900">
            <Invoice01Icon className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Aún no tienes ventas</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Tus facturas y recibos aparecerán aquí una vez que realices tu primera venta.
          </p>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Promocionar mi tienda</Button>
        </div>
      </div>
    </div>
  );
}
