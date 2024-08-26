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
exports.ScheduledMeetingDto = exports.ApplyForDto = exports.UsersResponseDto = void 0;
const class_validator_1 = require("class-validator");
const class_validator_2 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class UsersResponseDto {
}
exports.UsersResponseDto = UsersResponseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UsersResponseDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UsersResponseDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UsersResponseDto.prototype, "usersType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UsersResponseDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_2.IsArray)(),
    (0, class_validator_2.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ApplyForDto),
    __metadata("design:type", Array)
], UsersResponseDto.prototype, "applyFor", void 0);
class ApplyForDto {
}
exports.ApplyForDto = ApplyForDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplyForDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplyForDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplyForDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplyForDto.prototype, "attachments", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplyForDto.prototype, "applicationStatus", void 0);
__decorate([
    (0, class_validator_2.IsArray)(),
    (0, class_validator_2.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ScheduledMeetingDto),
    __metadata("design:type", Array)
], ApplyForDto.prototype, "scheduledMeeting", void 0);
class ScheduledMeetingDto {
}
exports.ScheduledMeetingDto = ScheduledMeetingDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduledMeetingDto.prototype, "scheduledTime", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduledMeetingDto.prototype, "meetingLink", void 0);
//# sourceMappingURL=usersResponse.dto.js.map