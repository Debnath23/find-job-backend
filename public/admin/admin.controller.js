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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const usersResponse_dto_1 = require("../dto/usersResponse.dto");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async scheduleMeeting(username, role, scheduleMeetingDto) {
        try {
            const updatedUser = await this.adminService.scheduledMeeting(username, role, scheduleMeetingDto);
            return this.adminService.getAllUsersDetails();
        }
        catch (error) {
            throw new common_1.HttpException('Internal Server Error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateApplicationStatus(username, role, applyForDto) {
        try {
            const updatedUser = await this.adminService.updateApplicationStatus(username, role, applyForDto);
            return this.adminService.getAllUsersDetails();
        }
        catch (error) {
            throw new common_1.HttpException('Internal Server Error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAllUsers(request) {
        if (!request.user) {
            throw new common_1.HttpException('Unauthorized', common_1.HttpStatus.UNAUTHORIZED);
        }
        const users = await this.adminService.getAllUsersDetails();
        return users;
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('schedule-meeting/:username/:role'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('role')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, usersResponse_dto_1.ScheduledMeetingDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "scheduleMeeting", null);
__decorate([
    (0, common_1.Post)('update-application-status/:username/:role'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('role')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, usersResponse_dto_1.ApplyForDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateApplicationStatus", null);
__decorate([
    (0, common_1.Get)('all-users'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllUsers", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map