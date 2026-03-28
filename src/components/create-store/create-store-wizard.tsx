"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { StoreRepositoryImpl } from "@/infrastructure/repositories/store.repository.impl";
import { AuthRepositoryImpl } from "@/infrastructure/repositories/auth.repository.impl";
import { CreateStoreUseCase } from "@/application/use-cases/store/create-store.use-case";
import type { CreateStorePayload } from "@/domain/entities/store.entity";
import {
  Store01Icon,
  Location01Icon,
  Image01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  CheckmarkCircle01Icon,
  Loading03Icon,
  Logout01Icon,
  InformationCircleIcon,
} from "hugeicons-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ImageCropper } from "@/components/ui/image-cropper";
import { CategoryVisualSelector } from "@/components/ui/category-visual-selector";
import { uploadImageAction, deleteImagesAction } from "@/app/actions/media.actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type StepId = 1 | 2 | 3;

interface WizardState extends CreateStorePayload { }

const INITIAL_STATE: WizardState = {
  name: "",
  description: "",
  rif: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  logo: "",
  categoryId: "",
};

// ─── Step Config ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: 1 as StepId,
    title: "Información Básica",
    description: "El nombre, descripción y datos de contacto de tu tienda",
    icon: Store01Icon,
  },
  {
    id: 2 as StepId,
    title: "Ubicación",
    description: "¿Dónde está tu tienda física o desde donde operas?",
    icon: Location01Icon,
  },
  {
    id: 3 as StepId,
    title: "Identidad Visual",
    description: "Logo y categoría principal de tu tienda",
    icon: Image01Icon,
  },
];

// ─── Animation Variants ──────────────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0,
  }),
};

// ─── Field Validation ─────────────────────────────────────────────────────────

function validateStep(step: StepId, data: WizardState): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step === 1) {
    if (!data.name.trim() || data.name.trim().length < 3)
      errors.name = "El nombre debe tener al menos 3 caracteres.";
    if (!data.description.trim() || data.description.trim().length < 20)
      errors.description = "La descripción debe tener al menos 20 caracteres.";
    if (!data.rif || data.rif.trim().length < 5)
      errors.rif = "El RIF es requerido (ej. J-12345678-0)";
    if (!data.phone || !/^\+?\d{7,15}$/.test(data.phone.replace(/\s/g, "")))
      errors.phone = "Número inválido. Incluye el código de país (ej. +58...)";
  }

  if (step === 2) {
    if (!data.address.trim()) errors.address = "La dirección es requerida.";
    if (!data.city.trim()) errors.city = "La ciudad es requerida.";
    if (!data.state.trim()) errors.state = "El estado es requerido.";
  }

  if (step === 3) {
    if (data.logo && !/^https?:\/\/.+/.test(data.logo))
      errors.logo = "Ingresa una URL válida (https://...).";
    if (!data.categoryId.trim()) errors.categoryId = "La categoría es requerida.";
  }

  return errors;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-1 text-xs font-medium text-red-500 overflow-hidden"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

function Field({ label, error, hint, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        {...props}
        className={`w-full rounded-xl border px-4 py-3 text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
          ${error ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"}`}
      />
      {hint && !error && <p className="text-xs text-gray-400 dark:text-gray-600 px-1">{hint}</p>}
      <FieldError message={error} />
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

function TextareaField({ label, error, hint, ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <textarea
        {...props}
        rows={3}
        className={`w-full rounded-xl border px-4 py-3 text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none
          ${error ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"}`}
      />
      {hint && !error && <p className="text-xs text-gray-400 dark:text-gray-600 px-1">{hint}</p>}
      <FieldError message={error} />
    </div>
  );
}

// ─── Step Forms ───────────────────────────────────────────────────────────────

function Step1Form({
  data,
  errors,
  onChange,
}: {
  data: WizardState;
  errors: Record<string, string>;
  onChange: (field: keyof WizardState, value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <Field
        label="Nombre de la tienda"
        type="text"
        placeholder="Mi Tienda Increíble"
        value={data.name}
        onChange={(e) => onChange("name", e.target.value)}
        error={errors.name}
        maxLength={100}
      />
      <TextareaField
        label="Descripción"
        placeholder="Cuéntale a tus clientes de qué se trata tu tienda (mín. 20 caracteres)"
        value={data.description}
        onChange={(e) => onChange("description", e.target.value)}
        error={errors.description}
        hint={`${data.description.length} / 20 mín.`}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          label="RIF"
          type="text"
          placeholder="J-12345678-0"
          value={data.rif}
          onChange={(e) => onChange("rif", e.target.value.toUpperCase())}
          error={errors.rif}
          hint="Ejemplo: J-12345678-0 · V-12345678-0"
        />
        <Field
          label="Teléfono"
          type="tel"
          placeholder="+584120000000"
          value={data.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          error={errors.phone}
          hint="Incluye el código de país"
        />
      </div>
    </div>
  );
}

function Step2Form({
  data,
  errors,
  onChange,
}: {
  data: WizardState;
  errors: Record<string, string>;
  onChange: (field: keyof WizardState, value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <Field
        label="Dirección"
        type="text"
        placeholder="Calle Principal #123"
        value={data.address}
        onChange={(e) => onChange("address", e.target.value)}
        error={errors.address}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          label="Ciudad"
          type="text"
          placeholder="Caracas"
          value={data.city}
          onChange={(e) => onChange("city", e.target.value)}
          error={errors.city}
        />
        <Field
          label="Estado"
          type="text"
          placeholder="Miranda"
          value={data.state}
          onChange={(e) => onChange("state", e.target.value)}
          error={errors.state}
        />
      </div>
    </div>
  );
}

function Step3Form({
  data,
  errors,
  onChange,
  onFileChange,
  logoPreview,
}: {
  data: WizardState;
  errors: Record<string, string>;
  onChange: (field: keyof WizardState, value: string) => void;
  onFileChange: (file: File) => void;
  logoPreview: string | null;
}) {
  return (
    <div className="space-y-8">
      {/* Logo Section */}
      <div className="space-y-3">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 px-1">
          Logo de tu Tienda
        </label>
        <ImageCropper
          onCropComplete={onFileChange}
          initialPreviewUrl={logoPreview}
          outputSize={{ width: 512, height: 512 }}
          label="Sube el logo de tu negocio"
        />
        <p className="text-[11px] text-gray-500 dark:text-gray-500 font-medium px-1 flex items-start gap-1.5">
          <InformationCircleIcon size={14} className="mt-0.5 shrink-0" />
          Se recomienda una imagen cuadrada. El sistema la optimizará automáticamente a 512x512px.
        </p>
      </div>

      {/* Category Section */}
      <div className="space-y-3">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 px-1">
          Categoría Principal
        </label>
        <CategoryVisualSelector
          value={data.categoryId}
          onChange={(id) => onChange("categoryId", id)}
          error={errors.categoryId}
        />
        <p className="text-[11px] text-gray-500 dark:text-gray-500 font-medium px-1 flex items-start gap-1.5">
          <InformationCircleIcon size={14} className="mt-0.5 shrink-0" />
          Esta será la categoría bajo la cual se listará tu tienda en el marketplace.
        </p>
      </div>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

const storeRepository = new StoreRepositoryImpl();
const authRepository = new AuthRepositoryImpl();
const createStoreUseCase = new CreateStoreUseCase(storeRepository);

export function CreateStoreWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [direction, setDirection] = useState(0); // For sliding animations
  const [data, setData] = useState<WizardState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoFile = (file: File) => {
    setLogoFile(file);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    const url = URL.createObjectURL(file);
    setLogoPreview(url);

    // Clear any previous logo error if present
    if (errors.logo) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.logo;
        return next;
      });
    }
  };

  const handleLogout = () => {
    authRepository.logout();
    router.push("/");
  };

  const handleChange = (field: keyof WizardState, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleNext = () => {
    const stepErrors = validateStep(currentStep, data);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, 3) as StepId);
  };

  const handleBack = () => {
    setErrors({});
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1) as StepId);
  };

  const handleSubmit = async () => {
    const stepErrors = validateStep(3, data);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let finalData = { ...data };
      let uploadedImageId: string | null = null;

      // 1. Subir logo si se seleccionó uno
      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        
        const uploadResult = await uploadImageAction(formData);
        
        if (uploadResult.error) {
          throw new Error(uploadResult.error);
        }

        if (uploadResult.status === "success" && uploadResult.data?.url) {
          finalData.logo = uploadResult.data.url;
          uploadedImageId = uploadResult.data.id;
        } else {
          throw new Error("No se pudo obtener la URL de la imagen subida.");
        }
      }

      // 2. Crear la tienda (con rollback si falla)
      try {
        await createStoreUseCase.execute(finalData);
        router.push("/tienda");
      } catch (storeError) {
        // Rollback: Eliminar la imagen si falla la creación de la tienda
        if (uploadedImageId) {
          await deleteImagesAction([uploadedImageId]);
        }
        throw storeError;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido al crear la tienda.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepConfig = STEPS.find((s) => s.id === currentStep)!;
  const StepIcon = currentStepConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Store01Icon size={16} strokeWidth={2} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm tracking-tight">Tu Lojita para Vendedores</span>
          </motion.div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all duration-300"
            >
              <Logout01Icon size={18} strokeWidth={2} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs font-bold tracking-tight">Cerrar Sesión</span>
            </button>

            <div className="h-4 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block" />

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex items-start justify-center py-10 px-6 sm:py-16">
        <div className="w-full max-w-2xl flex flex-col gap-10">

          {/* Stepper */}
          <div className="flex items-center gap-0 w-full px-2 sm:px-6">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;

              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-3 relative">
                    <motion.div
                      initial={false}
                      animate={{
                        backgroundColor: isCompleted || isActive ? "#4f46e5" : "rgba(79, 70, 229, 0)",
                        borderColor: isCompleted || isActive ? "#4f46e5" : "#d1d5db",
                        scale: isActive ? 1.1 : 1,
                      }}
                      className={`h-11 w-11 rounded-full flex items-center justify-center border-2 transition-all duration-500
                        ${isCompleted || isActive ? "text-white" : "text-gray-300 dark:text-gray-800"}`}
                    >
                      {isCompleted ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckmarkCircle01Icon size={20} strokeWidth={2.5} />
                        </motion.div>
                      ) : (
                        <Icon size={20} strokeWidth={2} />
                      )}
                    </motion.div>

                    <motion.span
                      animate={{
                        opacity: isActive ? 1 : 0.6,
                        y: isActive ? 0 : 2
                      }}
                      className={`text-[10px] sm:text-xs font-bold whitespace-nowrap hidden xs:block tracking-wide
                        ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-600"}`}
                    >
                      {step.title}
                    </motion.span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-4 bg-gray-200 dark:bg-gray-800 overflow-hidden rounded-full">
                      <motion.div
                        initial={false}
                        animate={{ width: isCompleted ? "100%" : "0%" }}
                        className="h-full bg-indigo-600"
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Card Container */}
          <div className="relative">
            <motion.div
              layout
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl dark:shadow-black/20 overflow-hidden"
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                >
                  {/* Card Header */}
                  <div className="px-8 py-8 sm:px-10 sm:py-9 border-b border-gray-100/50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-gray-900/30">
                    <div className="flex items-center gap-5">
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 shadow-inner"
                      >
                        <StepIcon size={28} strokeWidth={2} className="text-indigo-600 dark:text-indigo-400" />
                      </motion.div>
                      <div>
                        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-500 uppercase tracking-widest mb-1 px-1">
                          PASO {currentStep} DE {STEPS.length}
                        </p>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-none tracking-tight">{currentStepConfig.title}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium leading-relaxed">{currentStepConfig.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="px-8 py-8 sm:px-10 sm:py-10">
                    {currentStep === 1 && <Step1Form data={data} errors={errors} onChange={handleChange} />}
                    {currentStep === 2 && <Step2Form data={data} errors={errors} onChange={handleChange} />}
                    {currentStep === 3 && (
                      <Step3Form
                        data={data}
                        errors={errors}
                        onChange={handleChange}
                        onFileChange={handleLogoFile}
                        logoPreview={logoPreview}
                      />
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Submit Error */}
              <AnimatePresence>
                {submitError && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mx-8 sm:mx-10 mb-6 px-5 py-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 flex items-start gap-3 overflow-hidden"
                  >
                    <CheckmarkCircle01Icon size={18} className="text-red-500 shrink-0 rotate-45" />
                    <p className="text-sm font-bold text-red-600 dark:text-red-400 leading-tight">{submitError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Card Footer / Navigation */}
              <div className="px-8 py-6 sm:px-10 sm:py-8 border-t border-gray-100/50 dark:border-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/20 dark:bg-gray-900/20">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm group"
                >
                  <ArrowLeft01Icon size={18} strokeWidth={2} className="group-hover:-translate-x-1 transition-transform" />
                  Anterior
                </motion.button>

                {currentStep < 3 ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all group"
                  >
                    Continuar
                    <ArrowRight01Icon size={18} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "#4338ca" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loading03Icon size={18} strokeWidth={2.5} className="animate-spin" />
                        Validando y creando...
                      </>
                    ) : (
                      <>
                        <CheckmarkCircle01Icon size={18} strokeWidth={2.5} />
                        ¡Empezar mi negocio!
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Footer hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-[11px] text-gray-400 dark:text-gray-600 font-bold uppercase tracking-wider px-6"
          >
            Configuración protegida por Tu Lojita Inc. <br className="xs:hidden" />
            Podrás editar todo esto más tarde.
          </motion.p>
        </div>
      </main>
    </div>
  );
}

