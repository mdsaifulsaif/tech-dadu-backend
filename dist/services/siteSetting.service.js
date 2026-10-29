"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteSettingService = void 0;
const siteSetting_model_1 = require("../models/siteSetting.model");
class SiteSettingService {
    // Retrieve site settings (returns default if not set yet)
    static async getSettings() {
        let settings = await siteSetting_model_1.SiteSetting.findOne();
        if (!settings) {
            settings = await siteSetting_model_1.SiteSetting.create({});
        }
        return settings;
    }
    // Update site settings (Admin only)
    static async updateSettings(data) {
        const updated = await siteSetting_model_1.SiteSetting.findOneAndUpdate({}, { $set: data }, { new: true, upsert: true, runValidators: true });
        return updated;
    }
}
exports.SiteSettingService = SiteSettingService;
