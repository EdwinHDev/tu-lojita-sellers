import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Store01Icon, 
  SmartPhone01Icon, 
  Location01Icon, 
  Tag01Icon,
  CheckmarkCircle01Icon,
  Loading03Icon,
  HelpSquareIcon,
  Edit01Icon,
  LockPasswordIcon
} from "hugeicons-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { StoreRepositoryImpl } from "@/infrastructure/repositories/store.repository.impl";
import { CategoryRepositoryImpl } from "@/infrastructure/repositories/category.repository.impl";
import { GetStoreUseCase } from "@/application/use-cases/store/get-store.use-case";
import { UpdateStoreUseCase } from "@/application/use-cases/store/update-store.use-case";
import { Store } from "@/domain/entities/store.entity";
import { Category } from "@/domain/entities/category.entity";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const storeSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  phone: z.string().min(8, "Teléfono inválido"),
  address: z.string().min(5, "Dirección inválida"),
  city: z.string().min(2, "Ciudad requerida"),
  state: z.string().min(2, "Estado requerido"),
  categoryId: z.string().min(1, "Selecciona una categoría"),
});

type StoreFormData = z.infer<typeof storeSchema>;

interface StoreProfileFormProps {
  storeId: string;
}

const storeRepository = new StoreRepositoryImpl();
const globalCategoryRepository = new CategoryRepositoryImpl();
const getStoreUseCase = new GetStoreUseCase(storeRepository);
const updateStoreUseCase = new UpdateStoreUseCase(storeRepository);

export function StoreProfileForm({ storeId }: StoreProfileFormProps) {
  const [store, setStore] = useState<Store | null>(null);
  const [globalCategories, setGlobalCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [storeData, cats] = await Promise.all([
          getStoreUseCase.execute(storeId),
          globalCategoryRepository.findAll()
        ]);
        
        const validatedCats = Array.isArray(cats) ? cats : [];
        setGlobalCategories(validatedCats);
        setStore(storeData);
        
        // Reset the form with store data
        reset({
          name: storeData.name,
          description: storeData.description,
          phone: storeData.phone,
          address: storeData.address,
          city: storeData.city,
          state: storeData.state,
          categoryId: storeData.categoryId || storeData.category?.id || "",
        });
      } catch (error) {
        console.error("Error loading store data:", error);
      }
    };
    loadData();
  }, [storeId, reset]);

  // Sync categoryId specifically when globalCategories are loaded
  useEffect(() => {
    const currentCatId = store?.categoryId || store?.category?.id;
    if (globalCategories.length > 0 && currentCatId) {
      setValue("categoryId", currentCatId);
    }
  }, [globalCategories, store, setValue]);

  const onSubmit = async (data: StoreFormData) => {
    try {
      setIsSubmitting(true);
      setSuccessMessage(null);
      await updateStoreUseCase.execute(storeId, data);
      setSuccessMessage("Perfil actualizado correctamente");
      reset(data);
      setIsLocked(true);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error updating store:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!store) {
    return (
      <div className="space-y-6">
        <div className="h-48 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />
        <div className="h-48 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8 pb-32">
      {/* Información General */}
      <Card className="rounded-3xl shadow-none border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50">
        <CardHeader className="border-b border-gray-50 dark:border-gray-800/50 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
                <Store01Icon size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Identidad Comercial</CardTitle>
                <CardDescription className="text-xs">Información básica y legal de tu establecimiento.</CardDescription>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setIsLocked(!isLocked)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95",
                isLocked 
                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 hover:bg-indigo-100" 
                  : "bg-amber-100 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-200"
              )}
            >
              {isLocked ? (
                <><Edit01Icon size={14} /> Editar Perfil</>
              ) : (
                <><LockPasswordIcon size={14} /> Bloquear Edición</>
              )}
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <FieldLabel className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-2">
                RIF Registrado
                <Tooltip>
                  <TooltipTrigger>
                    <HelpSquareIcon size={14} className="text-gray-300 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>El RIF no puede ser modificado por seguridad fiscal.</TooltipContent>
                </Tooltip>
              </FieldLabel>
              <div className="relative group">
                <Tag01Icon size={16} className="absolute left-3 top-3 text-gray-400" />
                <Input value={store?.rif} disabled className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-800 text-gray-400 font-bold select-none h-11 rounded-xl" />
              </div>
            </Field>

            <Field>
              <FieldLabel className={cn(
                "text-xs font-bold mb-1.5 transition-colors",
                isLocked ? "text-gray-400" : "text-gray-700 dark:text-gray-300"
              )}>
                Nombre de la Tienda
              </FieldLabel>
              <div className="relative group">
                <Store01Icon size={16} className={cn(
                  "absolute left-3 top-3 transition-colors",
                  isLocked ? "text-gray-300" : "text-gray-400 group-focus-within:text-indigo-500"
                )} />
                <Input 
                  {...register("name")} 
                  disabled={isLocked}
                  className={cn(
                    "pl-10 h-11 rounded-xl border transition-all font-medium",
                    isLocked 
                      ? "bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 text-gray-400" 
                      : "border-gray-200 dark:border-gray-800 focus:border-indigo-500"
                  )} 
                  placeholder="Ejem. Tienda Los Mangos" 
                />
              </div>
              <FieldError errors={[errors.name]} />
            </Field>
          </div>

          <Field>
            <FieldLabel className={cn(
              "text-xs font-bold mb-1.5 transition-colors",
              isLocked ? "text-gray-400" : "text-gray-700 dark:text-gray-300"
            )}>
              Descripción del Negocio
            </FieldLabel>
            <textarea
              {...register("description")}
              disabled={isLocked}
              rows={3}
              placeholder="Cuéntanos un poco sobre lo que vendes o el servicio que prestas..."
              className={cn(
                "w-full rounded-2xl border px-4 py-3 text-sm font-medium transition-all resize-none",
                isLocked 
                  ? "bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 text-gray-400" 
                  : "bg-transparent border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              )}
            />
            <FieldError errors={[errors.description]} />
          </Field>

          <Field>
            <div className="flex items-center justify-between mb-1.5">
              <FieldLabel className={cn(
                "text-xs font-bold mb-0 transition-colors",
                isLocked ? "text-gray-400" : "text-gray-700 dark:text-gray-300"
              )}>
                Categoría de Negocio
              </FieldLabel>
              {!isLocked && (
                <span className="text-[10px] font-black text-amber-500 flex items-center gap-1 uppercase tracking-tighter">
                  <Edit01Icon size={10} /> Editable
                </span>
              )}
            </div>
            <div className="relative">
              <select
                {...register("categoryId")}
                disabled={isLocked}
                className={cn(
                  "w-full h-11 rounded-xl border px-4 text-sm font-medium outline-none transition-all appearance-none",
                  isLocked
                    ? "bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 text-gray-400 cursor-not-allowed"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                )}
              >
                <option value="">Selecciona la categoría principal...</option>
                {globalCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {isLocked && (
                <div className="absolute right-3 top-3.5 text-gray-300 pointer-events-none">
                  <LockPasswordIcon size={14} />
                </div>
              )}
            </div>
          </Field>
        </CardContent>
      </Card>

      {/* Ubicación y Contacto */}
      <Card className="rounded-3xl shadow-none border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50">
        <CardHeader className="border-b border-gray-50 dark:border-gray-800/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
              <Location01Icon size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Ubicación y Contacto</CardTitle>
              <CardDescription className="text-xs">Define dónde se encuentra tu tienda física.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <FieldLabel className={cn(
                "text-xs font-bold mb-1.5 transition-colors",
                isLocked ? "text-gray-400" : "text-gray-700 dark:text-gray-300"
              )}>
                Teléfono de Atención
              </FieldLabel>
              <div className="relative group">
                <SmartPhone01Icon size={16} className={cn(
                  "absolute left-3 top-3 transition-colors",
                  isLocked ? "text-gray-300" : "text-gray-400 group-focus-within:text-indigo-500"
                )} />
                <Input 
                  {...register("phone")} 
                  disabled={isLocked}
                  className={cn(
                    "pl-10 h-11 rounded-xl border transition-all font-medium",
                    isLocked 
                      ? "bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 text-gray-400" 
                      : "border-gray-200 dark:border-gray-800 focus:border-indigo-500"
                  )} 
                />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel className={cn(
                  "text-xs font-bold mb-1.5 transition-colors",
                  isLocked ? "text-gray-400" : "text-gray-700 dark:text-gray-300"
                )}>
                  Ciudad
                </FieldLabel>
                <Input 
                  {...register("city")} 
                  disabled={isLocked}
                  className={cn(
                    "h-11 rounded-xl border transition-all",
                    isLocked 
                      ? "bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 text-gray-400" 
                      : "border-gray-200 dark:border-gray-800"
                  )} 
                />
              </Field>
              <Field>
                <FieldLabel className={cn(
                  "text-xs font-bold mb-1.5 transition-colors",
                  isLocked ? "text-gray-400" : "text-gray-700 dark:text-gray-300"
                )}>
                  Estado
                </FieldLabel>
                <Input 
                  {...register("state")} 
                  disabled={isLocked}
                  className={cn(
                    "h-11 rounded-xl border transition-all",
                    isLocked 
                      ? "bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 text-gray-400" 
                      : "border-gray-200 dark:border-gray-800"
                  )} 
                />
              </Field>
            </div>
          </div>

          <Field>
            <FieldLabel className={cn(
              "text-xs font-bold mb-1.5 transition-colors",
              isLocked ? "text-gray-400" : "text-gray-700 dark:text-gray-300"
            )}>
              Dirección de la Sede
            </FieldLabel>
            <Input 
              {...register("address")} 
              disabled={isLocked}
              className={cn(
                "h-11 rounded-xl border transition-all",
                isLocked 
                  ? "bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 text-gray-400" 
                  : "border-gray-200 dark:border-gray-800 focus:border-indigo-500"
              )} 
            />
          </Field>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between gap-4 p-4 sm:p-6 bg-white dark:bg-black/40 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-3xl sticky bottom-4 sm:bottom-8 shadow-2xl z-20">
        <div className="flex-1 min-w-0">
          {successMessage ? (
            <p className="text-xs sm:text-sm font-black text-green-600 flex items-center gap-2">
              <CheckmarkCircle01Icon size={18} /> {successMessage}
            </p>
          ) : isDirty ? (
            <p className="text-xs sm:text-sm font-bold text-amber-500 truncate">Tienes cambios pendientes por guardar</p>
          ) : (
            <p className="text-xs sm:text-sm font-medium text-gray-400 truncate">No hay cambios realizados</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all text-sm shrink-0"
        >
          {isSubmitting ? <Loading03Icon className="animate-spin size-4" /> : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
