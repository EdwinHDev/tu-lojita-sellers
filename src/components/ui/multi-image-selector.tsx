"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  StarIcon,
  Delete02Icon,
  InformationCircleIcon,
} from "hugeicons-react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageCropper } from "./image-cropper";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MultiImageSelectorProps {
  onImagesChange?: (files: File[], primaryIndex: number) => void;
  maxImages?: number;
  className?: string;
}

interface ImageItem {
  id: string;
  file: File;
  preview: string;
}

export function MultiImageSelector({
  onImagesChange,
  maxImages = 10,
  className
}: MultiImageSelectorProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);

  // Notify parent whenever images or primary index change
  useEffect(() => {
    if (onImagesChange) {
      onImagesChange(images.map(img => img.file), primaryIndex);
    }
  }, [images, primaryIndex, onImagesChange]);

  const handleAddImage = useCallback((newFile: File) => {
    const newImage: ImageItem = {
      id: Math.random().toString(36).substring(7),
      file: newFile,
      preview: URL.createObjectURL(newFile),
    };

    setImages(prev => {
      if (prev.length >= maxImages) return prev;
      return [...prev, newImage];
    });
  }, [maxImages]);

  const handleRemoveImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);

      // Adjust primary index if needed
      if (primaryIndex === index) {
        setPrimaryIndex(0);
      } else if (primaryIndex > index) {
        setPrimaryIndex(prevIndex => prevIndex - 1);
      }

      return newImages;
    });
  };

  const handleSetPrimary = (index: number) => {
    setPrimaryIndex(index);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-wrap gap-6">
        <AnimatePresence initial={false}>
          {images.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              whileHover={{ y: -4 }}
              layout
              className={cn(
                "group relative w-36 h-36 rounded-xl border-2 transition-all shrink-0 overflow-hidden shadow-sm",
                primaryIndex === index
                  ? "border-indigo-600 ring-8 ring-indigo-500/5 shadow-2xl shadow-indigo-600/20"
                  : "border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.preview}
                alt={`Asset ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125"
              />

              {/* Technical Master Badge */}
              {primaryIndex === index && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-indigo-600/95 backdrop-blur-md text-[9px] font-black text-white uppercase tracking-[0.25em] rounded-lg shadow-xl flex items-center gap-1.5 z-10 border border-white/20">
                  <StarIcon size={10} fill="currentColor" strokeWidth={3} /> PORTADA
                </div>
              )}

              {/* Asset Index Badge (Pro Metadata) */}
              {! (primaryIndex === index) && (
                <div className="absolute top-2 left-2 h-6 w-6 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-lg text-[10px] font-black text-white/80 border border-white/10 z-10">
                  {index + 1}
                </div>
              )}

              {/* Pro Overlay Controls */}
              <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSetPrimary(index)}
                        className={cn(
                          "h-10 w-10 p-0 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-indigo-600 hover:border-indigo-500 hover:scale-110 transition-all duration-300 shadow-xl",
                          primaryIndex === index && "hidden"
                        )}
                      >
                        <StarIcon size={18} strokeWidth={2.5} />
                      </Button>
                    }
                  />
                  <TooltipContent className="font-black text-[9px] uppercase tracking-widest bg-slate-950 text-white border-slate-800">Set as Master</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveImage(index)}
                        className="h-10 w-10 p-0 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-red-600 hover:border-red-500 hover:scale-110 transition-all duration-300 shadow-xl"
                      >
                        <Delete02Icon size={18} strokeWidth={2.5} />
                      </Button>
                    }
                  />
                  <TooltipContent className="font-black text-[9px] uppercase tracking-widest bg-red-600 text-white border-none">Remove Asset</TooltipContent>
                </Tooltip>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pro Upload Trigger */}
        {images.length < maxImages && (
          <div className="w-36 h-36">
            <ImageCropper
              onCropComplete={handleAddImage}
              hidePreviewAfterCrop={true}
              className="w-full h-full"
            />
          </div>
        )}
      </div>

      {/* Dynamic Metadata Footer */}
      <div className="flex items-center justify-between px-2 pt-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        <div className="flex items-center gap-2">
          <InformationCircleIcon size={14} className="text-indigo-600" />
          <span>Capacidad de Almacenamiento: {images.length}/{maxImages}</span>
        </div>
        <div className="h-1.5 w-32 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-600" 
            initial={{ width: 0 }}
            animate={{ width: `${(images.length / maxImages) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
