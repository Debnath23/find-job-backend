import { UsersService } from './users.service';
import { ExpressRequest } from '../middlewares/auth.middleware';
import { ApplyForDto, UsersResponseDto } from '../dto/usersResponse.dto';
import { UsersEntity } from '../entities/users.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    currentUser(user: UsersEntity): Promise<UsersResponseDto>;
    applyFor(request: ExpressRequest, applyForDto: ApplyForDto, file: Express.Multer.File): Promise<UsersResponseDto>;
}
//# sourceMappingURL=users.controller.d.ts.map