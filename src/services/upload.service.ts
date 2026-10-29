import cloudinary from "../config/cloudinary";
import { UploadApiResponse } from "cloudinary";
import { ApiError } from "../utils/ApiError";

export class UploadService {
  // Upload a single file buffer to Cloudinary
  static async uploadBuffer(
    buffer: Buffer,
    folder: string = "tech-dadu"
  ): Promise<{ url: string; publicId: string; format: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result?: UploadApiResponse) => {
          if (error || !result) {
            return reject(
              new ApiError(500, `Cloudinary upload failed: ${error?.message || "Unknown error"}`)
            );
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  // Upload multiple file buffers
  static async uploadMultipleBuffers(
    files: Express.Multer.File[],
    folder: string = "tech-dadu/products"
  ): Promise<Array<{ url: string; publicId: string }>> {
    const uploadPromises = files.map((file) =>
      this.uploadBuffer(file.buffer, folder)
    );
    return await Promise.all(uploadPromises);
  }

  // Delete an image from Cloudinary
  static async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === "ok";
    } catch (error: any) {
      throw new ApiError(500, `Failed to delete image: ${error.message}`);
    }
  }
}

