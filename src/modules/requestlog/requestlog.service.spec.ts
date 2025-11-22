import { Test, TestingModule } from '@nestjs/testing';
import { RequestlogService } from './requestlog.service';

describe('RequestlogService', () => {
  let service: RequestlogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestlogService],
    }).compile();

    service = module.get<RequestlogService>(RequestlogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
