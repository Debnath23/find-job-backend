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
exports.RoomEntitySchema = exports.RoomEntity = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let RoomEntity = class RoomEntity extends mongoose_2.Document {
};
exports.RoomEntity = RoomEntity;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], RoomEntity.prototype, "roomName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], RoomEntity.prototype, "roomNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], RoomEntity.prototype, "seatCapacity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Types.ObjectId, ref: 'Booking' }], default: [] }),
    __metadata("design:type", Array)
], RoomEntity.prototype, "appliedCandidates", void 0);
exports.RoomEntity = RoomEntity = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], RoomEntity);
exports.RoomEntitySchema = mongoose_1.SchemaFactory.createForClass(RoomEntity);
//# sourceMappingURL=rooms.entity.js.map