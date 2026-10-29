import { SiteSetting, ISiteSetting } from "../models/siteSetting.model";

export class SiteSettingService {
  // Retrieve site settings (returns default if not set yet)
  static async getSettings(): Promise<ISiteSetting> {
    let settings = await SiteSetting.findOne();
    if (!settings) {
      settings = await SiteSetting.create({});
    }
    return settings;
  }

  // Update site settings (Admin only)
  static async updateSettings(data: Partial<ISiteSetting>): Promise<ISiteSetting> {
    const updated = await SiteSetting.findOneAndUpdate(
      {},
      { $set: data },
      { new: true, upsert: true, runValidators: true }
    );
    return updated;
  }
}

