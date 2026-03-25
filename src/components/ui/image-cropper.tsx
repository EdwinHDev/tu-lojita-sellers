"use client";

import React, { useState, useCallback } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image01Icon,
  ZoomIcon,
  RotateRight01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  Upload01Icon
} from "hugeicons-react";
import { Button } from "@/components/ui/button";

interface ImageCropperProps {
  aspect?: number;
  outputSize?: { width: number; height: number };
  quality?: number;
  backgroundColor?: string;
  onCropComplete: (file: File) => void;
  initialPreviewUrl?: string | null;
  label?: string;
  className?: string;
}

/**
 * Utility to create a canvas and get the cropped image as a File.
 */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  outputSize = { width: 1024, height: 1024 },
  quality = 0.9,
  backgroundColor = "#ffffff"
): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (error) => reject(error));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("No 2d context");

  // Set output dimensions
  canvas.width = outputSize.width;
  canvas.height = outputSize.height;

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the cropped image, scaled to fit the output size
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize.width,
    outputSize.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
        resolve(file);
      },
      "image/jpeg",
      quality
    );
  });
}

export function ImageCropper({
  aspect = 1,
  outputSize = { width: 1024, height: 1024 },
  quality = 0.9,
  backgroundColor = "#ffffff",
  onCropComplete,
  initialPreviewUrl = null,
  label = "Subir Imagen",
  className = "",
}: ImageCropperProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl || null);

  // Synchronize internal preview with initialPreviewUrl prop
  React.useEffect(() => {
    if (initialPreviewUrl) {
      setPreviewUrl(initialPreviewUrl);
    }
  }, [initialPreviewUrl]);

  // Lock scroll when cropping
  React.useEffect(() => {
    if (isCropping) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCropping]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropChange = (crop: Point) => setCrop(crop);
  const onZoomChange = (zoom: number) => setZoom(zoom);
  const onRotationChange = (rotation: number) => setRotation(rotation);

  const onCropCompleteCallback = useCallback((_: Area, currentCroppedAreaPixels: Area) => {
    setCroppedAreaPixels(currentCroppedAreaPixels);
  }, []);

  const handleConfirmCrop = async () => {
    if (imageSrc && croppedAreaPixels) {
      try {
        const croppedFile = await getCroppedImg(
          imageSrc,
          croppedAreaPixels,
          rotation,
          outputSize,
          quality,
          backgroundColor
        );
        const url = URL.createObjectURL(croppedFile);
        setPreviewUrl(url);
        onCropComplete(croppedFile);
        setIsCropping(false);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Trigger / Preview Area */}
      <div className="relative group max-w-[260px] mx-auto">
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
          id="image-input"
        />
        <label
          htmlFor="image-input"
          className="flex flex-col items-center justify-center w-full aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden group"
        >
          {previewUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-white">
                  <Upload01Icon size={24} />
                  <span className="text-xs font-bold uppercase tracking-wider">Cambiar Imagen</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-600">
              <div className="h-12 w-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                <Image01Icon size={24} />
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{label}</p>
                <p className="text-[10px] font-medium mt-1">PNG, JPG hasta 5MB</p>
              </div>
            </div>
          )}
        </label>
      </div>

      {/* Cropping Interface (Modal-like Overlay) */}
      <AnimatePresence>
        {isCropping && imageSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Cropper Area */}
              <div className="relative h-[350px] bg-neutral-200 dark:bg-slate-800">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={aspect}
                  onCropChange={onCropChange}
                  onCropComplete={onCropCompleteCallback}
                  onZoomChange={onZoomChange}
                  onRotationChange={onRotationChange}
                  classes={{
                    containerClassName: "rounded-t-3xl bg-neutral-200 dark:bg-slate-800",
                    mediaClassName: "max-h-full",
                  }}
                />
              </div>

              {/* Controls */}
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <ZoomIcon size={14} /> Zoom
                      </label>
                      <span className="text-[10px] font-bold text-indigo-600">{(zoom * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      aria-labelledby="Zoom"
                      onChange={(e) => onZoomChange(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <RotateRight01Icon size={14} /> Rotación
                      </label>
                      <span className="text-[10px] font-bold text-indigo-600">{rotation}°</span>
                    </div>
                    <input
                      type="range"
                      value={rotation}
                      min={0}
                      max={360}
                      step={1}
                      aria-labelledby="Rotation"
                      onChange={(e) => onRotationChange(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setIsCropping(false)}
                    className="rounded-2xl font-bold gap-2 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20"
                  >
                    <Cancel01Icon size={18} /> Cancelar
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleConfirmCrop}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl px-8 font-bold gap-2 shadow-xl shadow-indigo-600/20"
                  >
                    <CheckmarkCircle01Icon size={18} strokeWidth={2.5} /> Confirmar Recorte
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
