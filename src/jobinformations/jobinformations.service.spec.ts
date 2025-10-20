import { Test, TestingModule } from '@nestjs/testing';
import { JobinformationsService } from './jobinformations.service';

describe('JobinformationsService', () => {
  let service: JobinformationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobinformationsService],
    }).compile();

    service = module.get<JobinformationsService>(JobinformationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
