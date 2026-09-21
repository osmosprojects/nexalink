"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const SearchRepository_1 = require("../repositories/SearchRepository");
const response_1 = require("../helpers/response");
class SearchController {
    static async search(req, res, next) {
        try {
            const userId = req.user.userId;
            const q = req.query.q;
            const results = await SearchRepository_1.SearchRepository.globalSearch(userId, q || '');
            return (0, response_1.sendSuccess)(res, results);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.SearchController = SearchController;
