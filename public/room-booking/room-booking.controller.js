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
exports.RoomBookingController = void 0;
const common_1 = require("@nestjs/common");
const room_booking_service_1 = require("./room-booking.service");
const createRoom_dto_1 = require("../dto/createRoom.dto");
const date_fns_1 = require("date-fns");
const roomBooking_dto_1 = require("../dto/roomBooking.dto");
const swagger_1 = require("@nestjs/swagger");
const ApiResponse_1 = require("../responseTypes/ApiResponse");
let RoomBookingController = class RoomBookingController {
    constructor(roomBookingService) {
        this.roomBookingService = roomBookingService;
    }
    async createRoom(request, createRoomDto) {
        if (!request.user) {
            return (0, ApiResponse_1.ApiResponse)(null, 'Unauthorized: token may be expired!', 401);
        }
        const response = await this.roomBookingService.createRoom(request.user.usersType, createRoomDto);
        return (0, ApiResponse_1.ApiResponse)(response, 'Room created successfully!', 200);
    }
    async bookRoom(request, roomBookingDto) {
        if (!request.user) {
            return (0, ApiResponse_1.ApiResponse)(null, 'Unauthorized: token may be expired!', 401);
        }
        const userId = request.user._id;
        try {
            const bookingDateObj = (0, date_fns_1.parse)(roomBookingDto.bookingDate, 'yyyy-MM-dd', new Date());
            if (isNaN(bookingDateObj.getTime())) {
                throw new common_1.BadRequestException('Invalid booking date format.');
            }
            const bookingDateUTC = new Date(Date.UTC(bookingDateObj.getFullYear(), bookingDateObj.getMonth(), bookingDateObj.getDate()));
            const hasAlreadyApplied = await this.roomBookingService.hasUserAlreadyAppliedForDate(userId, bookingDateUTC);
            if (hasAlreadyApplied) {
                return (0, ApiResponse_1.ApiResponse)(null, 'User cannot book the same or different rooms more than once on the same date.', 409);
            }
            const response = await this.roomBookingService.bookRoom(userId, roomBookingDto.roomNumber, bookingDateUTC);
            return response;
        }
        catch (error) {
            console.log('Error: ', error);
            return (0, ApiResponse_1.ApiResponse)(null, 'There is no room for booking!', 404);
        }
    }
    async getBookingDetails(request, username, roomNumber, date, limit, offset) {
        try {
            const limitVal = limit ? parseInt(limit.toString(), 10) : 10;
            const offsetVal = offset ? parseInt(offset.toString(), 10) : 0;
            if (!request.user) {
                return (0, ApiResponse_1.ApiResponse)(null, 'Unauthorized', 401);
            }
            const userId = request.user._id;
            const userType = request.user.usersType;
            const isAdmin = userType === 1;
            let dateObj = null;
            if (date) {
                dateObj = (0, date_fns_1.parse)(date, 'yyyy-MM-dd', new Date());
                if (!(0, date_fns_1.isValid)(dateObj)) {
                    return (0, ApiResponse_1.ApiResponse)(null, 'Invalid booking date format.', 400);
                }
            }
            if (roomNumber && dateObj && username) {
                return isAdmin
                    ? await this.roomBookingService.getAUserBookingDetailsForAParticularDateAndRoom(username, roomNumber, dateObj)
                    : await this.roomBookingService.getUserBookingDetailsForAParticularDateAndRoom(userId, roomNumber, dateObj);
            }
            if (roomNumber && dateObj) {
                return isAdmin
                    ? await this.roomBookingService.getAllUserBookingDetailsForAParticularDateAndRoom(roomNumber, dateObj, limitVal, offsetVal)
                    : await this.roomBookingService.getUserBookingDetailsForAParticularDateAndRoom(userId, roomNumber, dateObj);
            }
            if (roomNumber && username) {
                return isAdmin
                    ? await this.roomBookingService.getAUserBookingDetailsForAParticularRoom(username, roomNumber, limitVal, offsetVal)
                    : await this.roomBookingService.getUserBookingDetailsForAParticularRoom(userId, roomNumber, limitVal, offsetVal);
            }
            if (roomNumber) {
                return isAdmin
                    ? await this.roomBookingService.getAllUserBookingDetailsForAParticularRoom(roomNumber, limitVal, offsetVal)
                    : await this.roomBookingService.getUserBookingDetailsForAParticularRoom(userId, roomNumber, limitVal, offsetVal);
            }
            if (username && isAdmin) {
                return await this.roomBookingService.getAUserBookingDetails(username, limitVal, offsetVal);
            }
            return isAdmin
                ? await this.roomBookingService.getAllUserBookingDetails(limitVal, offsetVal)
                : await this.roomBookingService.getUserBookingDetails(userId, limitVal, offsetVal);
        }
        catch (error) {
            console.log('Error: ', error);
            return (0, ApiResponse_1.ApiResponse)(null, 'Something went wrong while fetching user booking details', 500);
        }
    }
    async getRoomDetails(request, roomNumber, date, limit, offset, bookingLimit, bookingOffset) {
        try {
            const limitVal = limit ? parseInt(limit.toString(), 10) : 10;
            const offsetVal = offset ? parseInt(offset.toString(), 10) : 0;
            const bookingLimitVal = bookingLimit
                ? parseInt(bookingLimit.toString(), 10)
                : 10;
            const bookingOffsetVal = bookingOffset
                ? parseInt(bookingOffset.toString(), 10)
                : 0;
            if (!request.user) {
                return (0, ApiResponse_1.ApiResponse)(null, 'Unauthorized: token may be expired!', 401);
            }
            let dateObj = null;
            if (date) {
                dateObj = (0, date_fns_1.parse)(date, 'yyyy-MM-dd', new Date());
                if (!(0, date_fns_1.isValid)(dateObj)) {
                    return (0, ApiResponse_1.ApiResponse)(null, 'Invalid booking date format.', 400);
                }
            }
            if (roomNumber && dateObj) {
                const response = await this.roomBookingService.getRoomDetails(request.user.usersType, roomNumber, dateObj, limitVal, offsetVal);
                return response;
            }
            else if (roomNumber) {
                const response = await this.roomBookingService.getARoomDetails(request.user.usersType, roomNumber, limitVal, offsetVal);
                return response;
            }
            else {
                const response = await this.roomBookingService.getAllRoomDetails(request.user.usersType, limitVal, offsetVal, bookingLimitVal, bookingOffsetVal);
                return response;
            }
        }
        catch (error) {
            console.error('Error:', error);
            return (0, ApiResponse_1.ApiResponse)(null, 'Something went wrong while fetching room details', 500);
        }
    }
    async bookingAvailability(roomNumber, date, request) {
        if (!request.user) {
            return (0, ApiResponse_1.ApiResponse)(null, 'Unauthorized: token may be expired!', 401);
        }
        try {
            if (!date) {
                return (0, ApiResponse_1.ApiResponse)(null, 'Date is required.', 400);
            }
            const dateObj = (0, date_fns_1.parse)(date, 'yyyy-MM-dd', new Date());
            if (!(0, date_fns_1.isValid)(dateObj)) {
                return (0, ApiResponse_1.ApiResponse)(null, 'Invalid booking date format.', 400);
            }
            const response = await this.roomBookingService.findAvailableSeatsOfARoom(roomNumber, dateObj);
            return (0, ApiResponse_1.ApiResponse)(response, 'Bookings available for the room in the given date.', 200);
        }
        catch (error) {
            console.log('Error: ', error);
            return (0, ApiResponse_1.ApiResponse)(null, 'Something went wrong while fetching booking-availability of a room, Please check input parameters.', 500);
        }
    }
    async checkExistingRooms(request) {
        try {
            if (!request.user) {
                return (0, ApiResponse_1.ApiResponse)(null, 'Unauthorized', 401);
            }
            const response = await this.roomBookingService.checkExistingRooms();
            return (0, ApiResponse_1.ApiResponse)(response, 'Room exist.', 200);
        }
        catch (error) {
            console.log('Error: ', error);
            return (0, ApiResponse_1.ApiResponse)(null, 'Something went wrong while checking existing rooms!', 500);
        }
    }
};
exports.RoomBookingController = RoomBookingController;
__decorate([
    (0, common_1.Post)('create-room'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, createRoom_dto_1.CreateRoomDto]),
    __metadata("design:returntype", Promise)
], RoomBookingController.prototype, "createRoom", null);
__decorate([
    (0, common_1.Post)('book-room'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, roomBooking_dto_1.RoomBookingDto]),
    __metadata("design:returntype", Promise)
], RoomBookingController.prototype, "bookRoom", null);
__decorate([
    (0, common_1.Get)('get-booking-details'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('username')),
    __param(2, (0, common_1.Query)('roomNumber')),
    __param(3, (0, common_1.Query)('date')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, String, Number, Number]),
    __metadata("design:returntype", Promise)
], RoomBookingController.prototype, "getBookingDetails", null);
__decorate([
    (0, common_1.Get)('get-room-details'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('roomNumber')),
    __param(2, (0, common_1.Query)('date')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('offset')),
    __param(5, (0, common_1.Query)('bookingLimit')),
    __param(6, (0, common_1.Query)('bookingOffset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String, Number, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], RoomBookingController.prototype, "getRoomDetails", null);
__decorate([
    (0, common_1.Get)('booking-availability'),
    __param(0, (0, common_1.Query)('roomNumber')),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], RoomBookingController.prototype, "bookingAvailability", null);
__decorate([
    (0, common_1.Get)('check-existing-rooms'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoomBookingController.prototype, "checkExistingRooms", null);
exports.RoomBookingController = RoomBookingController = __decorate([
    (0, common_1.Controller)('room-booking'),
    (0, swagger_1.ApiTags)('Room Booking'),
    __metadata("design:paramtypes", [room_booking_service_1.RoomBookingService])
], RoomBookingController);
//# sourceMappingURL=room-booking.controller.js.map