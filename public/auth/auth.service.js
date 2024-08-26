"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const bcrypt_1 = require("bcrypt");
const mongoose_2 = require("mongoose");
const login_dto_1 = require("../dto/login.dto");
const users_entity_1 = require("../entities/users.entity");
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    constructor(usersModel, jwtService) {
        this.usersModel = usersModel;
        this.jwtService = jwtService;
    }
    async createUser(createUserDto) {
        const user = await this.usersModel.findOne({
            $or: [
                { username: createUserDto.username },
                { email: createUserDto.email },
            ]
        });
        if (user) {
            throw new common_1.HttpException('Username or Email is already taken', common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const createdUser = new this.usersModel(createUserDto);
        return createdUser.save();
    }
    async login(loginDto) {
        const user = await this.usersModel
            .findOne({ email: loginDto.email })
            .select('+password');
        if (!user) {
            throw new common_1.HttpException('User is not found!', common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const isPasswordCorrect = await (0, bcrypt_1.compare)(loginDto.password, user.password);
        if (!isPasswordCorrect) {
            throw new common_1.HttpException('Invalid Password!', common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        return user;
    }
    async buildAuthResponse(usersEntity) {
        return {
            username: usersEntity.username,
            email: usersEntity.email,
            usersType: usersEntity.usersType,
            applyFor: [],
            token: this.generateJwt(usersEntity),
        };
    }
    generateJwt(usersEntity) {
        try {
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT Secret is not defined');
            }
            return this.jwtService.sign({ email: usersEntity.email }, { secret });
        }
        catch (error) {
            console.error('Error generating JWT:', error.message);
            throw new Error('Error generating JWT');
        }
    }
    async validateUserByEmail(email) {
        return this.usersModel.findOne({ email });
    }
    async findByEmail(email) {
        return this.usersModel.findOne({ email });
    }
};
exports.AuthService = AuthService;
__decorate([
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "login", null);
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(users_entity_1.UsersEntity.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map