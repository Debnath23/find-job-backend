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
exports.JobEntitySchema = exports.JobEntity = exports.scheduledMeetingSchema = exports.scheduledMeetingEntity = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let scheduledMeetingEntity = class scheduledMeetingEntity {
};
exports.scheduledMeetingEntity = scheduledMeetingEntity;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], scheduledMeetingEntity.prototype, "scheduledTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], scheduledMeetingEntity.prototype, "meetingLink", void 0);
exports.scheduledMeetingEntity = scheduledMeetingEntity = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], scheduledMeetingEntity);
exports.scheduledMeetingSchema = mongoose_1.SchemaFactory.createForClass(scheduledMeetingEntity);
let JobEntity = class JobEntity extends mongoose_2.Document {
};
exports.JobEntity = JobEntity;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], JobEntity.prototype, "phoneNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], JobEntity.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], JobEntity.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], JobEntity.prototype, "attachments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }),
    __metadata("design:type", String)
], JobEntity.prototype, "applicationStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)([{ type: mongoose_2.Types.ObjectId, ref: 'scheduledMeetingEntity' }]),
    __metadata("design:type", Array)
], JobEntity.prototype, "scheduledMeeting", void 0);
exports.JobEntity = JobEntity = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], JobEntity);
exports.JobEntitySchema = mongoose_1.SchemaFactory.createForClass(JobEntity);
//# sourceMappingURL=job.entity.js.map