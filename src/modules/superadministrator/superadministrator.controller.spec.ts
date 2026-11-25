import { Test, TestingModule } from '@nestjs/testing';
import { SuperadministratorController } from './superadministrator.controller';
import { SuperadministratorService } from './superadministrator.service';
import { AdministratorService } from '../administrator/administrator.service';
import { RedisService } from '../redis/redis.service';

describe('SuperadministratorController', () => {
  let controller: SuperadministratorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperadministratorController],
      providers: [
        { provide: SuperadministratorService, useValue: {} },
        { provide: AdministratorService, useValue: {} },
        { provide: RedisService, useValue: { get: jest.fn(), setCache: jest.fn() } },
      ],
    }).compile();

    controller = module.get<SuperadministratorController>(SuperadministratorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});