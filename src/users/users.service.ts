import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/createUser.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UsersEntity } from './users.entity';
import { Model } from 'mongoose';
import { UsersResponseType } from '../types/usersResponse.type';
import { LoginDto } from '../dto/login.dto';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { UsersResponseDto } from 'src/dto/usersResponse.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UsersEntity.name) private usersModel: Model<UsersEntity>,
  ) {}

  buildUserResponse(usersEntity: UsersEntity): UsersResponseType {
    return {
      username: usersEntity.username,
      email: usersEntity.email,
      applyFor: usersEntity.applyFor,
      token: this.generateJwt(usersEntity),
    };
  }

  generateJwt(usersEntity: UsersEntity): string {
    return sign({ email: usersEntity.email }, process.env.JWT_SECRET);
  }

  async findByEmail(email: string): Promise<UsersEntity> {
    return this.usersModel.findOne({ email });
  }

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

  async loginUser(loginDto: LoginDto): Promise<UsersEntity> {
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
}
