import { Test, TestingModule } from '@nestjs/testing';
import { TimeofworkService } from './timeofwork.service';

describe('TimeofworkService', () => {
  let service: TimeofworkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimeofworkService],
    }).compile();

    service = module.get<TimeofworkService>(TimeofworkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
