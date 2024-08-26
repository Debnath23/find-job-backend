import { UsersEntity } from '../entities/users.entity';
import { Model } from 'mongoose';
import { ApplyForDto, UsersResponseDto } from '../dto/usersResponse.dto';
import { JobEntity } from '../entities/job.entity';
export declare class UsersService {
    private usersModel;
    private jobModel;
    constructor(usersModel: Model<UsersEntity>, jobModel: Model<JobEntity>);
    buildUserResponse(usersEntity: UsersEntity): Promise<UsersResponseDto>;
    generateJwt(usersEntity: UsersEntity): string;
    findByEmail(email: string): Promise<UsersEntity>;
    applyForJob(username: string, applyForDto: ApplyForDto): Promise<UsersEntity>;
}
//# sourceMappingURL=users.service.d.ts.map