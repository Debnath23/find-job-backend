"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jsonwebtoken_1 = require("jsonwebtoken");
const ApiResponse_1 = require("../responseTypes/ApiResponse");
let AuthMiddleware = class AuthMiddleware {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async use(req, res, next) {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            req.user = null;
            next();
            return (0, ApiResponse_1.ApiResponse)(null, 'No authentication header is found!', 404);
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET);
            const user = await this.usersService.findByEmail(decoded.email);
            if (!user) {
                req.user = null;
                return (0, ApiResponse_1.ApiResponse)(null, `User not found for email: ${decoded.email}`, 404);
            }
            else {
                req.user = user;
            }
            next();
        }
        catch (error) {
            req.user = null;
            next();
            return (0, ApiResponse_1.ApiResponse)(null, `JWT Verification Error: ${error.message}`, 400);
        }
    }
};
exports.AuthMiddleware = AuthMiddleware;
exports.AuthMiddleware = AuthMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], AuthMiddleware);
//# sourceMappingURL=auth.middleware.js.map