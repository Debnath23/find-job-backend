import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppliedCandidatesDto } from 'src/dto/appliedCandidates.dto';
import { CreateRoomDto } from 'src/dto/createRoom.dto';
import { ApplyForDto, ScheduledMeetingDto } from 'src/dto/usersResponse.dto';
import { ApplyRoomEntity } from 'src/entities/applyRoom.entity';
import { JobEntity } from 'src/entities/job.entity';
import { RoomEntity } from 'src/entities/rooms.entity';
import { UsersEntity } from 'src/entities/users.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(UsersEntity.name) private usersModel: Model<UsersEntity>,
    @InjectModel(JobEntity.name) private jobModel: Model<JobEntity>,
  ) {}

  //   TODO: buildAdminResponse

  async scheduledMeeting(
    username: string,
    role: string,
    scheduleMeetingDto: ScheduledMeetingDto,
  ): Promise<UsersEntity> {
    const jobEntity = await this.jobModel.findOne({ role });

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

      const userEntity = await this.usersModel
        .findOne({ username })
        .populate('applyFor');

      if (!userEntity) {
        throw new NotFoundException('User not found!');
      }

      return userEntity;
    } catch (error) {
      console.error('Error occurred during update: ', error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
