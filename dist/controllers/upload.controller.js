"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const upload_service_1 = require("../services/upload.service");
const response_1 = require("../utils/response");
const ApiError_1 = require("../utils/ApiError");
class UploadController {
    // Upload a single image
    static async uploadSingle(req, res, next) {
        try {
            if (!req.file) {
                throw new ApiError_1.ApiError(400, "Please provide an image file to upload");
            }
            const folder = (req.body.folder || "tech-dadu");
            const uploaded = await upload_service_1.UploadService.uploadBuffer(req.file.buffer, folder);
            return (0, response_1.sendResponse)(res, 201, true, "Image uploaded successfully", uploaded);
        }
        catch (error) {
            next(error);
        }
    }
    // Upload multiple images (e.g. for Product gallery)
    static async uploadMultiple(req, res, next) {
        try {
            const files = req.files;
            if (!files || files.length === 0) {
                throw new ApiError_1.ApiError(400, "Please provide image files to upload");
            }
            const folder = (req.body.folder || "tech-dadu/products");
            const uploaded = await upload_service_1.UploadService.uploadMultipleBuffers(files, folder);
            return (0, response_1.sendResponse)(res, 201, true, `${uploaded.length} images uploaded successfully`, uploaded);
        }
        catch (error) {
            next(error);
        }
    }
    // Delete image by public_id
    static async delete(req, res, next) {
        try {
            const publicId = req.params.publicId;
            if (!publicId) {
                throw new ApiError_1.ApiError(400, "Public ID is required to delete an image");
            }
            await upload_service_1.UploadService.deleteImage(publicId);
            return (0, response_1.sendResponse)(res, 200, true, "Image deleted from Cloudinary successfully");
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UploadController = UploadController;
