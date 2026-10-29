"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriberController = void 0;
const subscriber_service_1 = require("../services/subscriber.service");
const response_1 = require("../utils/response");
class SubscriberController {
    static async subscribe(req, res, next) {
        try {
            const { email, source } = req.body;
            const result = await subscriber_service_1.SubscriberService.subscribe(email, source);
            return (0, response_1.sendResponse)(res, 201, true, result.message, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async unsubscribe(req, res, next) {
        try {
            const { email } = req.body;
            const result = await subscriber_service_1.SubscriberService.unsubscribe(email);
            return (0, response_1.sendResponse)(res, 200, true, result.message, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getAll(req, res, next) {
        try {
            const page = req.query.page ? Number(req.query.page) : 1;
            const limit = req.query.limit ? Number(req.query.limit) : 20;
            const result = await subscriber_service_1.SubscriberService.getAllSubscribers(page, limit);
            return (0, response_1.sendResponse)(res, 200, true, "Subscribers retrieved successfully", result);
        }
        catch (error) {
            next(error);
        }
    }
    static async broadcast(req, res, next) {
        try {
            const { subject, content } = req.body;
            const result = await subscriber_service_1.SubscriberService.broadcastEmail(subject, content);
            return (0, response_1.sendResponse)(res, 200, true, result.message, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SubscriberController = SubscriberController;
