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
exports.UsersEntitySchema = exports.UsersEntity = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const bcrypt_1 = require("bcrypt");
const mongoose_2 = require("mongoose");
let UsersEntity = class UsersEntity extends mongoose_2.Document {
};
exports.UsersEntity = UsersEntity;
__decorate([
    (0, mongoose_1.Prop)({ unique: true, required: true }),
    __metadata("design:type", String)
], UsersEntity.prototype, "username", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], UsersEntity.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ select: false, required: true }),
    __metadata("design:type", String)
], UsersEntity.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)([{ type: mongoose_2.Types.ObjectId, ref: 'JobEntity' }]),
    __metadata("design:type", Array)
], UsersEntity.prototype, "applyFor", void 0);
__decorate([
    (0, mongoose_1.Prop)([{ type: mongoose_2.Types.ObjectId, ref: 'BookingEntity' }]),
    __metadata("design:type", Array)
], UsersEntity.prototype, "bookings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 2 }),
    __metadata("design:type", Number)
], UsersEntity.prototype, "usersType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], UsersEntity.prototype, "isActive", void 0);
exports.UsersEntity = UsersEntity = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], UsersEntity);
exports.UsersEntitySchema = mongoose_1.SchemaFactory.createForClass(UsersEntity);
exports.UsersEntitySchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        this.password = await (0, bcrypt_1.hash)(this.password, 10);
        next();
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=users.entity.js.map