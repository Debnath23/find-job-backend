import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/createUser.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UsersEntity } from '../entities/users.entity';
import { Model } from 'mongoose';
import { LoginDto } from '../dto/login.dto';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import {
  ApplyForDto,
  ScheduledMeetingDto,
  UsersResponseDto,
} from '../dto/usersResponse.dto';
import { JobEntity } from '../entities/job.entity';
import { Types } from 'mongoose';
import { uploadOnCloudinary } from '../utils/cloudinary';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UsersEntity.name) private usersModel: Model<UsersEntity>,
    @InjectModel(JobEntity.name) private jobModel: Model<JobEntity>,
  ) {}

  // TODO: Build different responses(for: applyForJob)

  async buildUserResponse(usersEntity: UsersEntity): Promise<UsersResponseDto> {
    const jobIds = usersEntity.applyFor as Types.ObjectId[];

    if (!jobIds || jobIds.length === 0) {
      return {
        username: usersEntity.username,
        email: usersEntity.email,
        applyFor: [],
        token: this.generateJwt(usersEntity),
      };
    }

    const jobEntities = await this.jobModel.find({ _id: { $in: jobIds } });

    if (!jobEntities || jobEntities.length === 0) {
      return {
        username: usersEntity.username,
        email: usersEntity.email,
        applyFor: [],
        token: this.generateJwt(usersEntity),
      };
    }

    const applyForDtos: ApplyForDto[] = jobEntities.map((job) => {
      const scheduledMeetingDtos = job.scheduledMeeting.map((meeting) => ({
        scheduledTime: meeting.scheduledTime,
        meetingLink: meeting.meetingLink,
      }));

      return {
        phoneNumber: job.phoneNumber,
        address: job.address,
        role: job.role,
        attachments: job.attachments,
        applicationStatus: job.applicationStatus,
        scheduledMeeting: scheduledMeetingDtos,
      };
    });

    return {
      username: usersEntity.username,
      email: usersEntity.email,
      applyFor: applyForDtos,
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

  async applyForJob(
    username: string,
    applyForDto: ApplyForDto,
  ): Promise<UsersEntity> {
    const user = await this.usersModel.findOne({ username });
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    const attachmentsLocalPath = applyForDto.attachments;

    if (!attachmentsLocalPath) {
      throw new HttpException(
        'Attachment file is required.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const attachments = await uploadOnCloudinary(attachmentsLocalPath);

    if (!attachments) {
      throw new HttpException(
        'Failed to upload attachment.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const appliedForJob = new this.jobModel({
      ...applyForDto,
      attachments: attachments.url,
    });

    await appliedForJob.save();

    user.applyFor.push(appliedForJob._id as Types.ObjectId);
    await user.save();

    return this.usersModel.findById(user._id).populate('applyFor').exec();
  }

  async scheduledMeeting(
    username: string,
    role: string,
    scheduleMeetingDto: ScheduledMeetingDto,
  ): Promise<UsersEntity> {
    const jobEntity = await this.jobModel.findOne({role});

    if (!jobEntity) {
      throw new NotFoundException('JobEntity is not found!');
    }

    jobEntity.scheduledMeeting.push(scheduleMeetingDto);

    await jobEntity.save();

    const updatedUsers = await this.usersModel.findOne({ username });

    if (!updatedUsers) {
      throw new NotFoundException('Users not found!');
    }

    return updatedUsers;
  }

  async getAllUsersDetails(): Promise<UsersEntity[]> {
    const users = await this.usersModel.find().exec();

    return users;
  }

  async updateApplicationStatus(
    username: string,
    role: string,
    applyForDto: ApplyForDto,
  ): Promise<UsersEntity> {
    try {
      const jobEntity = await this.jobModel.findOne({ role });
  
      if (!jobEntity) {
        throw new NotFoundException('Job with the specified role not found!');
      }
  
      jobEntity.applicationStatus = applyForDto.applicationStatus;
      await jobEntity.save();
  
      const userEntity = await this.usersModel.findOne({ username }).populate('applyFor');
  
      if (!userEntity) {
        throw new NotFoundException('User not found!');
      }
  
      return userEntity;
    } catch (error) {
      console.error("Error occurred during update: ", error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
