"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { StoreCategoryRepositoryImpl } from "@/infrastructure/repositories/store-category.repository.impl";
import { CreateStoreCategoryUseCase } from "@/application/use-cases/category/create-store-category.use-case";
import { UpdateStoreCategoryUseCase } from "@/application/use-cases/category/update-store-category.use-case";
import { Loading03Icon, PlusSignIcon, Edit01Icon } from "hugeicons-react";
import { StoreCategory } from "@/domain/entities/store-category.entity";

const categorySchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CreateCategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  onSuccess: (category: StoreCategory) => void;
  initialData?: StoreCategory | null;
}

const repository = new StoreCategoryRepositoryImpl();
const createUseCase = new CreateStoreCategoryUseCase(repository);
const updateUseCase = new UpdateStoreCategoryUseCase(repository);

export function CreateCategorySheet({
  isOpen,
  onClose,
  storeId,
  onSuccess,
  initialData,
}: CreateCategorySheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description || "",
      });
    } else {
      reset({
        name: "",
        description: "",
      });
    }
  }, [initialData, reset, isOpen]);

  const onSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      let result: StoreCategory;
      if (initialData) {
        result = await updateUseCase.execute(initialData.id, values);
      } else {
        result = await createUseCase.execute({
          ...values,
          storeId,
        });
      }
      onSuccess(result);
      reset();
      onClose();
    } catch (error) {
      console.error("Error al procesar categoría:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader className="pt-8 px-8">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center mb-4">
            {initialData ? (
              <Edit01Icon size={24} className="text-indigo-600" />
            ) : (
              <PlusSignIcon size={24} className="text-indigo-600" />
            )}
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight">
            {initialData ? "Editar Categoría" : "Nueva Categoría"}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-gray-500 mt-2">
            {initialData 
              ? "Actualiza la información de tu categoría para organizar mejor tus productos." 
              : "Define una agrupación para tus productos o servicios de forma sencilla."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 pt-2">
          <FieldGroup className="space-y-6">
            <Field>
              <FieldLabel className="text-xs font-bold text-gray-700 dark:text-gray-300">Nombre de la categoría</FieldLabel>
              <Input
                {...register("name")}
                placeholder="Ej. Comida Rápida, Consultas, Accesorios..."
                className="h-11 rounded-xl border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field>
              <FieldLabel className="text-xs font-bold text-gray-700 dark:text-gray-300">Descripción detallada</FieldLabel>
              <textarea
                {...register("description")}
                placeholder="Breve descripción de lo que incluirá esta categoría..."
                className="min-h-[120px] w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-transparent px-4 py-3 text-sm font-medium shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all"
              />
              <FieldError errors={[errors.description]} />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-10 gap-3 sm:flex-row flex-col">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 rounded-xl font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 h-11"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all font-black h-11"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loading03Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                initialData ? "Guardar Cambios" : "Crear Categoría"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
