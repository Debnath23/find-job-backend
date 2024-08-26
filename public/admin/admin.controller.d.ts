import { AdminService } from './admin.service';
import { ApplyForDto, ScheduledMeetingDto } from '../dto/usersResponse.dto';
import { UsersEntity } from '../entities/users.entity';
import { ExpressRequest } from '../middlewares/auth.middleware';
import { AdminResponseDto } from '../dto/adminResponse.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    scheduleMeeting(username: string, role: string, scheduleMeetingDto: ScheduledMeetingDto): Promise<AdminResponseDto>;
    updateApplicationStatus(username: string, role: string, applyForDto: ApplyForDto): Promise<AdminResponseDto>;
    getAllUsers(request: ExpressRequest): Promise<UsersEntity[]>;
}
//# sourceMappingURL=admin.controller.d.ts.map