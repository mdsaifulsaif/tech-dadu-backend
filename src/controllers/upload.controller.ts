import { Request, Response, NextFunction } from "express";
import { UploadService } from "../services/upload.service";
import { sendResponse } from "../utils/response";
import { ApiError } from "../utils/ApiError";

export class UploadController {
  // Upload a single image
  static async uploadSingle(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new ApiError(400, "Please provide an image file to upload");
      }

      const folder = (req.body.folder || "tech-dadu") as string;
      const uploaded = await UploadService.uploadBuffer(req.file.buffer, folder);

      return sendResponse(res, 201, true, "Image uploaded successfully", uploaded);
    } catch (error) {
      next(error);
    }
  }

  // Upload multiple images (e.g. for Product gallery)
  static async uploadMultiple(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        throw new ApiError(400, "Please provide image files to upload");
      }

      const folder = (req.body.folder || "tech-dadu/products") as string;
      const uploaded = await UploadService.uploadMultipleBuffers(files, folder);

      return sendResponse(
        res,
        201,
        true,
        `${uploaded.length} images uploaded successfully`,
        uploaded
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete image by public_id
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const publicId = req.params.publicId as string;
      if (!publicId) {
        throw new ApiError(400, "Public ID is required to delete an image");
      }

      await UploadService.deleteImage(publicId);
      return sendResponse(res, 200, true, "Image deleted from Cloudinary successfully");
    } catch (error) {
      next(error);
    }
  }
}
