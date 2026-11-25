import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { RedisService } from '../redis/redis.service';

describe('ItemsController', () => {
  let controller: ItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        { provide: ItemsService, useValue: {} },
        { provide: RedisService, useValue: { get: jest.fn(), setCache: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});