import { CreateStoreWizard } from "@/components/create-store/create-store-wizard";

export const metadata = {
  title: "Crear tu Tienda | Tu Lojita para Vendedores",
  description: "Configura tu primera tienda en minutos y empieza a vender.",
};

export default function CrearTiendaPage() {
  return <CreateStoreWizard />;
}
