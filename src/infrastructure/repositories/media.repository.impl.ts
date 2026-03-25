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

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/img/${id}`, {
      method: "DELETE",
      headers: {
        "x-api-key": this.apiKey,
      },
    });

    if (!response.ok) {
      console.warn(`No se pudo eliminar la imagen ${id} durante el rollback.`);
    }
  }
}
