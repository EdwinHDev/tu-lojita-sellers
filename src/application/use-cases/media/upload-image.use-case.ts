import { MediaRepositoryImpl } from "@/infrastructure/repositories/media.repository.impl";

/**
 * Use case to handle image upload.
 */
export class UploadImageUseCase {
  constructor(private readonly mediaRepository: MediaRepositoryImpl) {}

  async execute(file: File) {
    if (!file) throw new Error("No se proporcionó ningún archivo.");
    return this.mediaRepository.upload(file);
  }
}
