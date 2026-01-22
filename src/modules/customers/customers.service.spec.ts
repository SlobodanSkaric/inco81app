import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { Repository } from 'typeorm';
import { Customers } from 'entitets/entities/Customers';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock } from 'node:test';

const mokCustomersRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
} 

describe('CustomersService', () => {
  let service: CustomersService;
  let repository: Repository<Customers>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(Customers),
          useValue: mokCustomersRepository,
        }
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    repository = module.get<Repository<Customers>>(getRepositoryToken(Customers));

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it("Get all cutomers", async () =>{
    const mockCutomers = [
      {
        customerId: 1,
        customerName: "Slobodan1",
        isActive: true,
        contactEmail: "slobodan.skaric1@gmail.com",
        phoneNumber: "123456789",
        address: "Some Address"
      },
      {
        customerId: 2,
        customerName: "Slobodan2",
        isActive: true,
        contactEmail: "slobodan.skaric2@gmail.com",
        phoneNumber: "123456789",
        address: "Some Address"
      },
      {
        customerId: 3,
        customerName: "Slobodan3",
        isActive: true,
        contactEmail: "slobodan.skaric3@gmail.com",
        phoneNumber: "123456789",
        address: "Some Address"
      }
    ];

    mokCustomersRepository.find.mockResolvedValue(mockCutomers);

    const customers = await service.findAllCustomers();
    expect(customers).toEqual(mockCutomers);
    expect(mokCustomersRepository.find).toHaveBeenCalledTimes(1)
  });

  it("Get customer by id", async () =>{
    const mockCustomer = {
      customerId: 1,
      customerName: "Slobodan1",
      isActive: true,
      contactEmail: "slobodan.skaric1@gmail.com"
    };

    mokCustomersRepository.findOne.mockResolvedValue(mockCustomer);

    const customer = await service.findCustomersById(1);
    expect(customer).toEqual(mockCustomer);
    expect(mokCustomersRepository.findOne).toHaveBeenCalledWith({ where: { customerId: 1 } });
  });
});
