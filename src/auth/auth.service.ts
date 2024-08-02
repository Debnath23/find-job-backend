import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Model } from 'mongoose';
import { LoginDto } from '../dto/login.dto';
import { UsersResponseDto } from '../dto/usersResponse.dto';
import { UsersEntity } from '../entities/users.entity';
import { CreateUserDto } from '../dto/createUser.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UsersEntity.name) private usersModel: Model<UsersEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UsersEntity> {
    const user = await this.usersModel.findOne({ email: createUserDto.email });

    if (user) {
      throw new HttpException(
        'Email is already taken',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const createdUser = new this.usersModel(createUserDto);
    return createdUser.save();
  }

  async login(loginDto: LoginDto): Promise<UsersEntity> {
    const user = await this.usersModel
      .findOne({ email: loginDto.email })
      .select('+password');

    if (!user) {
      throw new HttpException(
        'User is not found!',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isPasswordCorrect = await compare(loginDto.password, user.password);

    if (!isPasswordCorrect) {
      throw new HttpException(
        'Invalid Password!',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return user;
  }

  async buildAuthResponse(usersEntity: UsersEntity): Promise<UsersResponseDto> {
    return {
      username: usersEntity.username,
      email: usersEntity.email,
      usersType: usersEntity.usersType,
      applyFor: [],
      token: this.generateJwt(usersEntity),
    };
  }

  generateJwt(usersEntity: UsersEntity): string {
    return sign({ email: usersEntity.email }, process.env.JWT_SECRET);
  }
}
