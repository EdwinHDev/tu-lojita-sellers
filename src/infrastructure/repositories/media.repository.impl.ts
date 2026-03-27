/**
 * Concrete implementation of the media repository for the local upload server.
 * Strict implementation as per user requirements.
 */
export class MediaRepositoryImpl {
  private readonly baseUrl = "http://localhost:4200";
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async upload(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Error al subir la imagen al servidor.");
    }

    return response.json();
  }

  async uploadBulk(files: File[], primaryIndex: number): Promise<any> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("primaryIndex", primaryIndex.toString());

    const response = await fetch(`${this.baseUrl}/upload/bulk`, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Error al subir las imágenes en lote.");
    }

    return response.json();
  }

  async deleteBulk(ids: string[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/img/bulk-delete`, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      console.warn(`No se pudieron eliminar las imágenes en lote durante el rollback.`);
    }
  }
}
