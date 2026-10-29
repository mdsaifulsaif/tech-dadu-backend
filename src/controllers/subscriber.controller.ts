import { Request, Response, NextFunction } from "express";
import { SubscriberService } from "../services/subscriber.service";
import { sendResponse } from "../utils/response";

export class SubscriberController {
  static async subscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, source } = req.body;
      const result = await SubscriberService.subscribe(email, source);
      return sendResponse(res, 201, true, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  static async unsubscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await SubscriberService.unsubscribe(email);
      return sendResponse(res, 200, true, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      const result = await SubscriberService.getAllSubscribers(page, limit);
      return sendResponse(res, 200, true, "Subscribers retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async broadcast(req: Request, res: Response, next: NextFunction) {
    try {
      const { subject, content } = req.body;
      const result = await SubscriberService.broadcastEmail(subject, content);
      return sendResponse(res, 200, true, result.message, result);
    } catch (error) {
      next(error);
    }
  }
}

