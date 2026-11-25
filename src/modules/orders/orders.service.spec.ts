import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { Orders } from 'src/entitets/entities/Orders';
import { Items } from 'src/entitets/entities/Items';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderGetAllDto } from './dtos/order.get.all.dto';
import { OrderPaymentMethod, OrderPaymentStatus, OrdersStatus } from './dtos/order.status.enum';
import { ApiResponse } from 'src/misc/api.response.dto';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockOrdersRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockItemsRepository = {
    find: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const stockUpdateQb = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockManager = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    decrement: jest.fn(),
    increment: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(stockUpdateQb),
  };

  const mockDataSource = {
    transaction: jest.fn(async (cb: (manager: typeof mockManager) => unknown) => cb(mockManager)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Orders), useValue: mockOrdersRepository },
        { provide: getRepositoryToken(Items), useValue: mockItemsRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('blocks complete when order is unpaid', async () => {
    mockManager.findOne.mockResolvedValue({
      orderId: 1,
      customerId: 1,
      orderStatus: OrdersStatus.ACTIVE,
      paymentStatus: OrderPaymentStatus.UNPAID,
    });

    const result = await service.changeOrderStatus(1, OrdersStatus.COMPLETED);

    expect(result).toBeInstanceOf(ApiResponse);
    expect((result as ApiResponse).code).toBe(400);
  });

  it('blocks active when order is unpaid', async () => {
    mockManager.findOne.mockResolvedValue({
      orderId: 1,
      customerId: 1,
      orderStatus: OrdersStatus.PENDING,
      paymentStatus: OrderPaymentStatus.UNPAID,
    });

    const result = await service.changeOrderStatus(1, OrdersStatus.ACTIVE);

    expect(result).toBeInstanceOf(ApiResponse);
    expect((result as ApiResponse).code).toBe(400);
  });

  it('creates order with payment method and unpaid status', async () => {
    const customer = { customerId: 5, isActive: true };
    const item = { itemId: 2, stockQuantity: 10, price: 12.5 };
    const savedOrder = {
      orderId: 9,
      customerId: 5,
      orderStatus: OrdersStatus.PENDING,
      paymentmethod: OrderPaymentMethod.CARDS,
      paymentStatus: OrderPaymentStatus.UNPAID,
    };

    mockManager.findOne.mockResolvedValue(customer);
    mockManager.find.mockResolvedValue([item]);
    mockManager.create.mockImplementation((_entity: unknown, data: unknown) => data);
    mockManager.save
      .mockResolvedValueOnce(savedOrder)
      .mockResolvedValueOnce([]);

    const result = await service.addOrder(
      {
        paymentMethod: OrderPaymentMethod.CARDS,
        items: [{ itemId: 2, quantity: 1 }],
      },
      5,
    );

    expect(result).toBeInstanceOf(OrderGetAllDto);
    expect(result as OrderGetAllDto).toEqual(
      expect.objectContaining({
        orderId: 9,
        customerId: 5,
        orderStatus: OrdersStatus.PENDING,
      }),
    );
  });
});
