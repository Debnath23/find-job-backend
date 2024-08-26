import { NestMiddleware } from '@nestjs/common';
import { UsersEntity } from '../entities/users.entity';
import { NextFunction, Response } from 'express';
import { UsersService } from '../users/users.service';
export interface ExpressRequest extends Request {
    user?: UsersEntity;
}
export declare class AuthMiddleware implements NestMiddleware {
    private usersService;
    constructor(usersService: UsersService);
    use(req: ExpressRequest, res: Response, next: NextFunction): Promise<{
        data: object;
        message: string;
        status: number;
    }>;
}
//# sourceMappingURL=auth.middleware.d.ts.map