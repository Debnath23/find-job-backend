import { AuthService } from '../auth/auth.service';
import { UsersEntity } from '../entities/users.entity';
import { NextFunction } from 'express';
export interface ExpressRequest extends Request {
    user?: UsersEntity;
}
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    private authService;
    constructor(authService: AuthService);
    validate(req: ExpressRequest, res: Response, next: NextFunction): Promise<void>;
}
export {};
//# sourceMappingURL=jwt.guard.d.ts.map