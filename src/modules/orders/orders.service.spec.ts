import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { Orders } from 'entitets/entities/Orders';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock } from 'node:test';
import { OrderGetAllDto } from './dtos/order.get.all.dto';

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

  it("Get all orders", async() =>{
    const mockOrders = [
      {
        orderId: 1,
        customerId: 1,
        orderStatus: "pending",
        totalAmount: 100.00,
      },
       {
        orderId: 2,
        customerId: 1,
        orderStatus: "active",
        totalAmount: 180.00,
      },
       {
        orderId: 3,
        customerId: 1,
        orderStatus: "pending",
        totalAmount: 170.00,
      }
    ];

    mockOrdersRepository.find.mockResolvedValue(mockOrders);

    const result = await service.getAllOrders();

    expect(result).toEqual(mockOrders);

    expect(mockOrdersRepository.find).toHaveBeenCalledTimes(1);
    expect(mockOrdersRepository.find).toHaveBeenCalledWith();
  });

  it("Get order by id", async() =>{
    const mockOrder = {
      orderId: 1,
      customerId: 1,
      orderStatus: "pending",
      totalAmount: 100.00,
    };


    mockOrdersRepository.findOne.mockResolvedValue(mockOrder);

    const reasult = await service.getOrderById(mockOrder.orderId);

    expect(reasult).toEqual(mockOrder);
    expect(mockOrdersRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockOrdersRepository.findOne).toHaveBeenCalledWith({ where: {orderId: mockOrder.orderId}});
  });

  it("Get order by status", async() =>{
    const mockOrders =[
      {
        orderId: 1,
        customerId: 1,
        orderStatus: "pending",
        totalAmount: 100.00,
      },
       {
        orderId: 3,
        customerId: 1,
        orderStatus: "pending",
        totalAmount: 170.00,
      } 
    ];

      const status = "pending";

    mockOrdersRepository.find.mockResolvedValue(mockOrders);

    const reasult = await service.getOrderStatus(status);

    expect(reasult).toEqual(mockOrders);
    expect(mockOrdersRepository.find).toHaveBeenCalledWith({ where: {orderStatus: status}});
  });

  it("Change order status", async() =>{
    const mockOrder = {
      orderId: 1,
      customerId: 1,
      orderStatus: "pending",
      totalAmount: 100.00,
    };

    const newStatus = "active";

    mockOrdersRepository.findOne.mockResolvedValue(mockOrder);
    mockOrdersRepository.save.mockResolvedValue({...mockOrder, orderStatus: newStatus});

    const result = await service.changeOrderStatus(mockOrder.orderId, newStatus);

    expect(result).toBeInstanceOf(OrderGetAllDto);
    expect((result as OrderGetAllDto).orderStatus).toEqual(newStatus);
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ 
      orderId: mockOrder.orderId, 
      orderStatus: newStatus
     }));
  });

  it("Get orders by customer id", async() =>{
    const mockOrders = [
      {
        orderId: 1,
        customerId: 1,
        orderStatus: "pending",
        totalAmount: 100.00,
      },
       {
        orderId: 2,
        customerId: 1,
        orderStatus: "active",
        totalAmount: 180.00,
      },
       {
        orderId: 3,
        customerId: 1,
        orderStatus: "pending",
        totalAmount: 170.00,
      }
    ];

    const customerId = 1;

    mockOrdersRepository.find.mockResolvedValue(mockOrders);

    const result = await service.getOrdersByCustomerId(customerId);

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toBeInstanceOf(OrderGetAllDto);

    expect(result as OrderGetAllDto[]).toEqual(mockOrders);
    expect(mockOrdersRepository.find).toHaveBeenCalledWith({ where: {customerId: customerId}});
  });

  it("Add order", async() =>{
    const mockOrder = {
      orderId: 1,
      customerId: 1,
      orderStatus: "pending",
      totalAmount: 100.00,
    };

    const orderAddDto = {
      customerId: 1,
      orderStatus: "pending",
      totalAmount: 100.00,
    };

    mockOrdersRepository.save.mockResolvedValue(mockOrder);

    const result = await service.addOrder(orderAddDto);

    expect(result).toBeInstanceOf(OrderGetAllDto);
    expect(result as OrderGetAllDto).toEqual(mockOrder);
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
      customerId: orderAddDto.customerId,
      orderStatus: orderAddDto.orderStatus,
      totalAmount: orderAddDto.totalAmount
    }));
  });
});
