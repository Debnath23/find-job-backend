import { Model, Types } from 'mongoose';
import { BookingEntity } from '../entities/booking.entity';
import { RoomEntity } from '../entities/rooms.entity';
import { CreateRoomDto } from '../dto/createRoom.dto';
import { UsersEntity } from '../entities/users.entity';
export declare class RoomBookingService {
    private userModel;
    private roomModel;
    private bookingModel;
    constructor(userModel: Model<UsersEntity>, roomModel: Model<RoomEntity>, bookingModel: Model<BookingEntity>);
    createRoom(usersType: number, createRoomDto: CreateRoomDto): Promise<{
        data: object;
        message: string;
        status: number;
    }>;
    bookRoom(userId: Types.ObjectId, roomNumber: number, bookingDate: Date): Promise<{
        data: object;
        message: string;
        status: number;
    }>;
    hasUserAlreadyAppliedForDate(userId: Types.ObjectId, bookingDate: Date): Promise<true | {
        data: object;
        message: string;
        status: number;
    }>;
    findAvailableSeatsOfARoom(roomNumber: number, date: Date): Promise<{
        seatCapacity: number;
        numberOfBookings: number;
        availableSeats: number;
    }>;
    getUserBookingDetailsForAParticularDateAndRoom(userId: Types.ObjectId, roomNumber: number, dateObj: Date): Promise<{
        data: object;
        message: string;
        status: number;
    }>;
    getUserBookingDetailsForAParticularRoom(userId: Types.ObjectId, roomNumber: number, limitVal: number, offsetVal: number): Promise<{
        data: object;
        message: string;
        status: number;
    }>;
    getUserBookingDetails(userId: Types.ObjectId, limitVal: number, offsetVal: number): Promise<{
        data: object;
        message: string;
        status: number;
    }>;
    getAllUserBookingDetailsForAParticularDateAndRoom(roomNumber: number, date: Date, limitVal: number, offsetVal: number): Promise<{
        data: object;
        message: string;
        status: number;
    }>;
    getAllUserBookingDetailsForAParticularRoom(roomNumber: number, limitVal: number, offsetVal: number): Promise<{
        data: object;
        message: string;
        status: number;
    }>;
    getAllUserBookingDetails(limitVal: number, offsetVal: number): Promise<{
        data: object;
        message: string;
        status: number;
    }>;
    getAUserBookingDetailsForAParticularDateAndRoom(username: string, roomNumber: number, dateObj: Date): Promise<{
        data: object;
        message: string;
        status: number;
    }>;
    getAUserBookingDetailsForAParticularRoom(username: string, roomNumber: number, limitVal: number, offsetVal: number): Promise<{
        data: object;
        message: string;
        status: number;
    }>;
    getAUserBookingDetails(username: string, limitVal: number, offsetVal: number): Promise<{
        data: object;
        message: string;
        status: number;
    }>;
    getRoomDetails(usersType: number, roomNumber: number, dateObj: Date, limitVal: number, offsetVal: number): Promise<{
        data: object;
        message: string;
        status: number;
    }>;
    getARoomDetails(usersType: number, roomNumber: number, limitVal: number, offsetVal: number): Promise<{
        data: object;
        message: string;
        status: number;
    }>;
    getAllRoomDetails(usersType: number, limitVal: number, offsetVal: number, bookingLimitVal: number, bookingOffsetVal: number): Promise<{
        data: object;
        message: string;
        status: number;
    }>;
    checkExistingRooms(): Promise<{
        data: object;
        message: string;
        status: number;
    } | {
        roomNumber: number;
        roomName: string;
    }[]>;
}
//# sourceMappingURL=room-booking.service.d.ts.map