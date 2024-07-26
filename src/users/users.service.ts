import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/createUser.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UsersEntity } from './users.entity';
import { Model } from 'mongoose';
import { UsersResponseType } from '../types/usersResponse.type';
import { LoginDto } from '../dto/login.dto';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { ApplyForDto, UsersResponseDto } from '../dto/usersResponse.dto';
import { JobEntity } from './job.entity';
import { Types } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UsersEntity.name) private usersModel: Model<UsersEntity>,
    @InjectModel(JobEntity.name) private jobModel: Model<JobEntity>,
  ) {}

  buildUserResponse(usersEntity: UsersEntity): UsersResponseDto {
    return {
      username: usersEntity.username,
      email: usersEntity.email,
      applyFor: usersEntity.applyFor as unknown as ApplyForDto[],
      token: this.generateJwt(usersEntity),
    };
  }

  generateJwt(usersEntity: UsersEntity): string {
    return sign({ email: usersEntity.email }, 'JWT_SECRET');
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

  // async applyForJob(applyForDto: ApplyForDto): Promise<UsersEntity> {
  //   const appliedForJob = new this.jobModel(applyForDto);
  //   return appliedForJob.save();
  // }

  async applyForJob(username: string, applyForDto: ApplyForDto): Promise<UsersEntity> {
    const user = await this.usersModel.findOne({username});
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const appliedForJob = new this.jobModel(applyForDto);
    await appliedForJob.save();

    user.applyFor.push(appliedForJob._id as Types.ObjectId);
    await user.save();

    // Populate the applyFor field with actual job documents
    return this.usersModel.findById(user._id).populate('applyFor').exec();
  }
}
