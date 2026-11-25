import { Test, TestingModule } from '@nestjs/testing';
import { AdministratorController } from './administrator.controller';
import { AdministratorService } from './administrator.service';
import { OrdersService } from '../orders/orders.service';
import { RedisService } from '../redis/redis.service';

describe('AdministratorController', () => {
  let controller: AdministratorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdministratorController],
      providers: [
        { provide: AdministratorService, useValue: {} },
        { provide: OrdersService, useValue: {} },
        { provide: RedisService, useValue: { get: jest.fn(), setCache: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AdministratorController>(AdministratorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});