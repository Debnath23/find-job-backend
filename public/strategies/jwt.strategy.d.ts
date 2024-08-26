import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth/auth.service';
import { UsersEntity } from '../entities/users.entity';
import { NextFunction } from 'express';
export interface ExpressRequest extends Request {
    user?: UsersEntity;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(req: ExpressRequest, res: Response, next: NextFunction): Promise<void>;
}
export {};
//# sourceMappingURL=jwt.strategy.d.ts.map