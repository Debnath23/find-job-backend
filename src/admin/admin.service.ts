import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
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
        @InjectModel(RoomEntity.name) private roomModel: Model<RoomEntity>,
        @InjectModel(ApplyRoomEntity.name)
    private applyRoomModel: Model<ApplyRoomEntity>,
      ) {}

    //   TODO: buildAdminResponse
    
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
    
      async createRoom(usersType: number , createRoomDto: CreateRoomDto): Promise<RoomEntity> {
    
        if (usersType === 1) {
          const room = await this.roomModel.findOne({
            roomName: createRoomDto.roomName,
          });
      
          if (room) {
            throw new HttpException(
              'Room is already created!',
              HttpStatus.UNPROCESSABLE_ENTITY,
            );
          }
      
          const createdRoom = new this.roomModel(createRoomDto);
          return createdRoom.save();
        } else {
          throw new HttpException(
            'Creating room service is not available for you!',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
      }
}
