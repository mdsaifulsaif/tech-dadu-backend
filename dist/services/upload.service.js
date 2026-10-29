"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const ApiError_1 = require("../utils/ApiError");
class UploadService {
    // Upload a single file buffer to Cloudinary
    static async uploadBuffer(buffer, folder = "tech-dadu") {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.default.uploader.upload_stream({
                folder,
                resource_type: "image",
            }, (error, result) => {
                if (error || !result) {
                    return reject(new ApiError_1.ApiError(500, `Cloudinary upload failed: ${error?.message || "Unknown error"}`));
                }
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    format: result.format,
                });
            });
            uploadStream.end(buffer);
        });
    }
    // Upload multiple file buffers
    static async uploadMultipleBuffers(files, folder = "tech-dadu/products") {
        const uploadPromises = files.map((file) => this.uploadBuffer(file.buffer, folder));
        return await Promise.all(uploadPromises);
    }
    // Delete an image from Cloudinary
    static async deleteImage(publicId) {
        try {
            const result = await cloudinary_1.default.uploader.destroy(publicId);
            return result.result === "ok";
        }
        catch (error) {
            throw new ApiError_1.ApiError(500, `Failed to delete image: ${error.message}`);
        }
    }
}
exports.UploadService = UploadService;
