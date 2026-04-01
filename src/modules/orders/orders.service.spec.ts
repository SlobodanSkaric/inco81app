import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { Orders } from 'entitets/entities/Orders';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

const mockOrdersRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
}

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: Repository<Orders>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersService,
        {
          provide: getRepositoryToken(Orders),
          useValue: mockOrdersRepository,
        }
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    repository = module.get<Repository<Orders>>(getRepositoryToken(Orders));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
