import { LoginDto } from '../dto/login.dto';
import { UsersResponseDto } from '../dto/usersResponse.dto';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../dto/createUser.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    createUser(createUserDto: CreateUserDto): Promise<UsersResponseDto>;
    login(loginDto: LoginDto): Promise<UsersResponseDto>;
}
//# sourceMappingURL=auth.controller.d.ts.map