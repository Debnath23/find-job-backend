import { Model } from 'mongoose';
import { LoginDto } from '../dto/login.dto';
import { UsersResponseDto } from '../dto/usersResponse.dto';
import { UsersEntity } from '../entities/users.entity';
import { CreateUserDto } from '../dto/createUser.dto';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private usersModel;
    private jwtService;
    constructor(usersModel: Model<UsersEntity>, jwtService: JwtService);
    createUser(createUserDto: CreateUserDto): Promise<UsersEntity>;
    login(loginDto: LoginDto): Promise<UsersEntity>;
    buildAuthResponse(usersEntity: UsersEntity): Promise<UsersResponseDto>;
    generateJwt(usersEntity: UsersEntity): string;
    validateUserByEmail(email: string): Promise<UsersEntity | null>;
    findByEmail(email: string): Promise<UsersEntity>;
}
//# sourceMappingURL=auth.service.d.ts.map