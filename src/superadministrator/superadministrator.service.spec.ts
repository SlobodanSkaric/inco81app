import { Test, TestingModule } from '@nestjs/testing';
import { SuperadministratorService } from './superadministrator.service';

describe('SuperadministratorService', () => {
  let service: SuperadministratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuperadministratorService],
    }).compile();

    service = module.get<SuperadministratorService>(SuperadministratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
