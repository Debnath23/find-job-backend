import { RoomBookingService } from './room-booking.service';
import { ExpressRequest } from '../middlewares/auth.middleware';
import { CreateRoomDto } from '../dto/createRoom.dto';
import { RoomBookingDto } from '../dto/roomBooking.dto';
export declare class RoomBookingController {
    private readonly roomBookingService;
    constructor(roomBookingService: RoomBookingService);
    createRoom(request: ExpressRequest, createRoomDto: CreateRoomDto): Promise<{
        data: object;
        message: string;
        status: number;
    }>;
    bookRoom(request: ExpressRequest, roomBookingDto: RoomBookingDto): Promise<{
        data: object;
        message: string;
        status: number;
    }>;
    getBookingDetails(request: ExpressRequest, username?: string, roomNumber?: number, date?: string, limit?: number, offset?: number): Promise<{
        data: object;
        message: string;
        status: number;
    }>;
    getRoomDetails(request: ExpressRequest, roomNumber?: number, date?: string, limit?: number, offset?: number, bookingLimit?: number, bookingOffset?: number): Promise<{
        data: object;
        message: string;
        status: number;
    }>;
    bookingAvailability(roomNumber: number, date: string, request: ExpressRequest): Promise<{
        data: object;
        message: string;
        status: number;
    }>;
    checkExistingRooms(request: ExpressRequest): Promise<{
        data: object;
        message: string;
        status: number;
    }>;
}
//# sourceMappingURL=room-booking.controller.d.ts.map