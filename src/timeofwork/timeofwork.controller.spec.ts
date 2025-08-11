import { Test, TestingModule } from '@nestjs/testing';
import { TimeofworkController } from './timeofwork.controller';

describe('TimeofworkController', () => {
  let controller: TimeofworkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeofworkController],
    }).compile();

    controller = module.get<TimeofworkController>(TimeofworkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
