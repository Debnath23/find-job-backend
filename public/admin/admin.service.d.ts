import { Model } from 'mongoose';
import { ApplyForDto, ScheduledMeetingDto } from '../dto/usersResponse.dto';
import { JobEntity } from '../entities/job.entity';
import { UsersEntity } from '../entities/users.entity';
export declare class AdminService {
    private usersModel;
    private jobModel;
    constructor(usersModel: Model<UsersEntity>, jobModel: Model<JobEntity>);
    scheduledMeeting(username: string, role: string, scheduleMeetingDto: ScheduledMeetingDto): Promise<UsersEntity>;
    getAllUsersDetails(): Promise<UsersEntity[]>;
    updateApplicationStatus(username: string, role: string, applyForDto: ApplyForDto): Promise<UsersEntity>;
}
//# sourceMappingURL=admin.service.d.ts.map