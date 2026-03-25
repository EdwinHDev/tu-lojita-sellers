"use server";

import { MediaRepositoryImpl } from "@/infrastructure/repositories/media.repository.impl";
import { UploadImageUseCase } from "@/application/use-cases/media/upload-image.use-case";

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
 * Server Action to delete an image (used for rollback).
 */
export async function deleteImageAction(imageId: string): Promise<void> {
  try {
    const apiKey = process.env.IMAGES_API_KEY;
    if (!apiKey) return;

    const repo = new MediaRepositoryImpl(apiKey);
    await repo.delete(imageId);
  } catch (error) {
    console.error("Delete Rollback Error:", error);
  }
}
