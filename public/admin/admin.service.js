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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const job_entity_1 = require("../entities/job.entity");
const users_entity_1 = require("../entities/users.entity");
let AdminService = class AdminService {
    constructor(usersModel, jobModel) {
        this.usersModel = usersModel;
        this.jobModel = jobModel;
    }
    async scheduledMeeting(username, role, scheduleMeetingDto) {
        const jobEntity = await this.jobModel.findOne({ role });
        if (!jobEntity) {
            throw new common_1.NotFoundException('JobEntity is not found!');
        }
        jobEntity.scheduledMeeting.push(scheduleMeetingDto);
        await jobEntity.save();
        const updatedUsers = await this.usersModel.findOne({ username });
        if (!updatedUsers) {
            throw new common_1.NotFoundException('Users not found!');
        }
        return updatedUsers;
    }
    async getAllUsersDetails() {
        const users = await this.usersModel.find().exec();
        return users;
    }
    async updateApplicationStatus(username, role, applyForDto) {
        try {
            const jobEntity = await this.jobModel.findOne({ role });
            if (!jobEntity) {
                throw new common_1.NotFoundException('Job with the specified role not found!');
            }
            jobEntity.applicationStatus = applyForDto.applicationStatus;
            await jobEntity.save();
            const userEntity = await this.usersModel
                .findOne({ username })
                .populate('applyFor');
            if (!userEntity) {
                throw new common_1.NotFoundException('User not found!');
            }
            return userEntity;
        }
        catch (error) {
            console.error('Error occurred during update: ', error);
            throw new common_1.HttpException('Internal Server Error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(users_entity_1.UsersEntity.name)),
    __param(1, (0, mongoose_1.InjectModel)(job_entity_1.JobEntity.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], AdminService);
//# sourceMappingURL=admin.service.js.map