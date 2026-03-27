import { MediaRepositoryImpl } from "@/infrastructure/repositories/media.repository.impl";

/**
 * Use case to handle batch image uploads.
 */
export class UploadImagesUseCase {
  constructor(private readonly mediaRepository: MediaRepositoryImpl) {}

  async execute(files: File[], primaryIndex: number) {
    if (!files || files.length === 0) {
      throw new Error("No se proporcionaron archivos para subir.");
    }
    return this.mediaRepository.uploadBulk(files, primaryIndex);
  }
}
