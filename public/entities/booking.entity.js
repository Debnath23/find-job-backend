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
exports.BookingEntitySchema = exports.BookingEntity = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let BookingEntity = class BookingEntity extends mongoose_2.Document {
};
exports.BookingEntity = BookingEntity;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], BookingEntity.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], BookingEntity.prototype, "roomName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], BookingEntity.prototype, "roomNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], BookingEntity.prototype, "bookingDate", void 0);
exports.BookingEntity = BookingEntity = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], BookingEntity);
const BookingEntitySchema = mongoose_1.SchemaFactory.createForClass(BookingEntity);
exports.BookingEntitySchema = BookingEntitySchema;
BookingEntitySchema.pre('save', function (next) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (this.bookingDate < today) {
        const error = new Error('Cannot book for past dates.');
        return next(error);
    }
    next();
});
//# sourceMappingURL=booking.entity.js.map