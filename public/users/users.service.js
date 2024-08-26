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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const users_entity_1 = require("../entities/users.entity");
const mongoose_2 = require("mongoose");
const jsonwebtoken_1 = require("jsonwebtoken");
const job_entity_1 = require("../entities/job.entity");
const cloudinary_1 = require("../utils/cloudinary");
let UsersService = class UsersService {
    constructor(usersModel, jobModel) {
        this.usersModel = usersModel;
        this.jobModel = jobModel;
    }
    async buildUserResponse(usersEntity) {
        const jobIds = usersEntity.applyFor;
        if (!jobIds || jobIds.length === 0) {
            return {
                username: usersEntity.username,
                email: usersEntity.email,
                usersType: usersEntity.usersType,
                applyFor: [],
                token: this.generateJwt(usersEntity),
            };
        }
        const jobEntities = await this.jobModel.find({ _id: { $in: jobIds } });
        const applyForDtos = jobEntities.map((job) => {
            const scheduledMeetingDtos = job.scheduledMeeting.map((meeting) => ({
                scheduledTime: meeting.scheduledTime,
                meetingLink: meeting.meetingLink,
            }));
            return {
                phoneNumber: job.phoneNumber,
                address: job.address,
                role: job.role,
                attachments: job.attachments,
                applicationStatus: job.applicationStatus,
                scheduledMeeting: scheduledMeetingDtos,
            };
        });
        if (!jobEntities || jobEntities.length === 0) {
            return {
                username: usersEntity.username,
                email: usersEntity.email,
                usersType: usersEntity.usersType,
                applyFor: applyForDtos,
                token: this.generateJwt(usersEntity),
            };
        }
        return {
            username: usersEntity.username,
            email: usersEntity.email,
            usersType: usersEntity.usersType,
            applyFor: applyForDtos,
            token: this.generateJwt(usersEntity),
        };
    }
    generateJwt(usersEntity) {
        return (0, jsonwebtoken_1.sign)({ email: usersEntity.email }, 'JWT_SECRET');
    }
    async findByEmail(email) {
        return this.usersModel.findOne({ email });
    }
    async applyForJob(username, applyForDto) {
        const user = await this.usersModel.findOne({ username });
        if (!user) {
            throw new common_1.NotFoundException('User not found!');
        }
        const attachmentsLocalPath = applyForDto.attachments;
        if (!attachmentsLocalPath) {
            throw new common_1.HttpException('Attachment file is required.', common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const attachments = await (0, cloudinary_1.uploadOnCloudinary)(attachmentsLocalPath);
        if (!attachments) {
            throw new common_1.HttpException('Failed to upload attachment.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const appliedForJob = new this.jobModel(Object.assign(Object.assign({}, applyForDto), { attachments: attachments.url }));
        await appliedForJob.save();
        user.applyFor.push(appliedForJob._id);
        await user.save();
        return this.usersModel.findById(user._id).populate('applyFor').exec();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(users_entity_1.UsersEntity.name)),
    __param(1, (0, mongoose_1.InjectModel)(job_entity_1.JobEntity.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map