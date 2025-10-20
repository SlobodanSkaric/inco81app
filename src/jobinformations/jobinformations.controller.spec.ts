import { Test, TestingModule } from '@nestjs/testing';
import { JobinformationsController } from './jobinformations.controller';

describe('JobinformationsController', () => {
  let controller: JobinformationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobinformationsController],
    }).compile();

    controller = module.get<JobinformationsController>(JobinformationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
