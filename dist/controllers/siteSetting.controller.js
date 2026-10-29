"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteSettingController = void 0;
const siteSetting_service_1 = require("../services/siteSetting.service");
const response_1 = require("../utils/response");
class SiteSettingController {
    // Public endpoint for frontend to read GTM, SEO meta, site name, logo etc.
    static async get(req, res, next) {
        try {
            const settings = await siteSetting_service_1.SiteSettingService.getSettings();
            return (0, response_1.sendResponse)(res, 200, true, "Site settings retrieved successfully", settings);
        }
        catch (error) {
            next(error);
        }
    }
    // Admin endpoint to update GTM, GA4, Meta, Pinterest IDs, etc.
    static async update(req, res, next) {
        try {
            const settings = await siteSetting_service_1.SiteSettingService.updateSettings(req.body);
            return (0, response_1.sendResponse)(res, 200, true, "Site settings updated successfully", settings);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SiteSettingController = SiteSettingController;
