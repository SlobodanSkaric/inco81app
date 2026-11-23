import { Test, TestingModule } from '@nestjs/testing';
import { TimeofworkController } from './timeofwork.controller';
import { TimeofworkService } from './timeofwork.service';

describe('TimeofworkController', () => {
  let controller: TimeofworkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeofworkController],
      providers: [
        {
          provide: TimeofworkService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<TimeofworkController>(TimeofworkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});