"use server";

import { MediaRepositoryImpl } from "@/infrastructure/repositories/media.repository.impl";
import { UploadImageUseCase } from "@/application/use-cases/media/upload-image.use-case";
import { UploadImagesUseCase } from "@/application/use-cases/media/upload-images.use-case";

/**
 * Server Action to securely upload multiple images using the IMAGES_API_KEY.
 */
export async function uploadImagesAction(formData: FormData): Promise<any> {
  try {
    const files = formData.getAll("files") as File[];
    const primaryIndexStr = formData.get("primaryIndex") as string;
    const primaryIndex = primaryIndexStr ? parseInt(primaryIndexStr, 10) : 0;
    
    const apiKey = process.env.IMAGES_API_KEY;
    if (!apiKey) throw new Error("API Key no encontrada en el servidor.");

    const repo = new MediaRepositoryImpl(apiKey);
    const useCase = new UploadImagesUseCase(repo);

    const result = await useCase.execute(files, primaryIndex);
    return result;
  } catch (error) {
    console.error("Bulk Upload Error:", error);
    return { error: error instanceof Error ? error.message : "Error desconocido" };
  }
}

/**
 * Server Action to securely upload images using the IMAGES_API_KEY.
 */
export async function uploadImageAction(formData: FormData): Promise<any> {
  try {
    const file = formData.get("file") as File;
    const apiKey = process.env.IMAGES_API_KEY;

    if (!apiKey) throw new Error("API Key no encontrada en el servidor.");

    const repo = new MediaRepositoryImpl(apiKey);
    const useCase = new UploadImageUseCase(repo);

    const result = await useCase.execute(file);
    return result;
  } catch (error) {
    console.error("Upload Error:", error);
    return { error: error instanceof Error ? error.message : "Error desconocido" };
  }
}

/**
 * Server Action to delete multiple images (used for rollback).
 */
export async function deleteImagesAction(imageIds: string[]): Promise<void> {
  try {
    const apiKey = process.env.IMAGES_API_KEY;
    if (!apiKey || !imageIds.length) return;

    const repo = new MediaRepositoryImpl(apiKey);
    await repo.deleteBulk(imageIds);
  } catch (error) {
    console.error("Bulk Delete Rollback Error:", error);
  }
}
