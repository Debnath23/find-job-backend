import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UsersEntity } from '../entities/users.entity';
import { Model } from 'mongoose';
import { sign } from 'jsonwebtoken';
import {
  ApplyForDto,
  UsersResponseDto,
} from '../dto/usersResponse.dto';
import { JobEntity } from '../entities/job.entity';
import { Types } from 'mongoose';
import { uploadOnCloudinary } from '../utils/cloudinary';
import { RoomEntity } from '../entities/rooms.entity';
import { ApplyRoomEntity } from '../entities/applyRoom.entity';
import { CreateRoomDto } from '../dto/createRoom.dto';
import { AppliedCandidatesDto } from '../dto/appliedCandidates.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UsersEntity.name) private usersModel: Model<UsersEntity>,
    @InjectModel(JobEntity.name) private jobModel: Model<JobEntity>,
    @InjectModel(ApplyRoomEntity.name)
    private applyRoomModel: Model<ApplyRoomEntity>,
  ) {}

  // TODO: applyForJob response

  async buildUserResponse(usersEntity: UsersEntity): Promise<UsersResponseDto> {

    
    const jobIds = usersEntity.applyFor as Types.ObjectId[];

    if (!jobIds || jobIds.length === 0) {
      return {
        username: usersEntity.username,
        email: usersEntity.email,
        usersType: usersEntity.usersType,
        applyFor: [],
        token: this.generateJwt(usersEntity),
      };
    }

    const jobEntities = await this.jobModel.find({ _id: { $in: jobIds } });

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

    if (!jobEntities || jobEntities.length === 0) {
      return {
        username: usersEntity.username,
        email: usersEntity.email,
        usersType: usersEntity.usersType,
        applyFor: applyForDtos,
        token: this.generateJwt(usersEntity),
      };
    }

    return {
      username: usersEntity.username,
      email: usersEntity.email,
      usersType: usersEntity.usersType,
      applyFor: applyForDtos,
      token: this.generateJwt(usersEntity),
    };
  }

  async createRoomResponse(roomEntity: RoomEntity): Promise<CreateRoomDto> {
    const appliedCandidatesIds =
      roomEntity.appliedCandidates as Types.ObjectId[];

    let appliedCandidatesDtos: AppliedCandidatesDto[] = [];

    if (appliedCandidatesIds && appliedCandidatesIds.length > 0) {
      const appliedCandidatesEntities = await this.applyRoomModel.find({
        _id: { $in: appliedCandidatesIds },
      });

      if (appliedCandidatesEntities && appliedCandidatesEntities.length > 0) {
        appliedCandidatesDtos = appliedCandidatesEntities.map((candidate) => ({
          username: candidate.username,
        }));
      }
    }

    return {
      roomName: roomEntity.roomName,
      roomNumber: roomEntity.roomNumber,
      seatCapacity: roomEntity.seatCapacity,
      availableSeat: roomEntity.availableSeat,
      appliedCandidates: appliedCandidatesDtos,
    };
  }

  generateJwt(usersEntity: UsersEntity): string {
    return sign({ email: usersEntity.email }, 'JWT_SECRET');
  }

  async findByEmail(email: string): Promise<UsersEntity> {
    return this.usersModel.findOne({ email });
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
}
