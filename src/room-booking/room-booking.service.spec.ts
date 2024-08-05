import { Test, TestingModule } from '@nestjs/testing';
import { RoomBookingService } from './room-booking.service';

describe('RoomBookingService', () => {
  let service: RoomBookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomBookingService],
    }).compile();

    service = module.get<RoomBookingService>(RoomBookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
