"use client";

import { PackageIcon, PlusSignIcon } from "hugeicons-react";
import { Button } from "@/components/ui/button";

export default function InventarioPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Inventario</h2>
        <div className="flex items-center space-x-2">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <PlusSignIcon className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed border-gray-200 dark:border-gray-800">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900">
            <PackageIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No hay productos aún</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Comienza agregando productos a tu inventario para empezar a vender.
          </p>
          <Button variant="outline" className="border-gray-200 dark:border-gray-800">Ver tutorial</Button>
        </div>
      </div>
    </div>
  );
}
