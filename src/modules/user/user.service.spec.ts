import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { Users } from 'entitets/entities/Users';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock } from 'node:test';
import { Customers } from 'entitets/entities/Customers';
import { Administrator } from 'entitets/entities/Administrator';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<Users>;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn()
  }

  const mockCustomerRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn()
  }

  const mockAdministrorRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(Users),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Customers),
          useValue: mockCustomerRepository,
        },
        {
          provide: getRepositoryToken(Administrator),
          useValue: mockAdministrorRepository,
        }
      ],    
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<Users>>(getRepositoryToken(Users));
  });

  /*it('should create user', async () => {
    const dto = {
      name: "Slobodan",
      lastname: "Skaric",
      email: "slobodan.skaric@gmail.com",
      phonenumber: "0605444756",
      sumTimeOfWork: "",
      timeOfWorks: [],
    }

    const saveUserData  = {
      userId: 1,
      ...dto,      
    }

    mockUserRepository.create.mockReturnValue(saveUserData);
    mockUserRepository.save.mockResolvedValue(saveUserData);

    const result = await service.addUser(dto as any);

    expect(mockUserRepository.create).toHaveBeenCalledWith(dto);
    expect(mockUserRepository.save).toHaveBeenCalledWith(saveUserData);
    expect(result).toEqual(saveUserData);
  });*/
 
  it('should return user by id', async () => {
    const userId = 1;
    const mockUser = {
      userId: 1,
      name: "Slobodan",
      lastname: "Skaric",
      email: "slobodan.skaric@gmail.com",
      phonenumber: "0605444756",
      sumTimeOfWork: "",
      timeOfWorks: [],
    }

    mockUserRepository.findOne.mockResolvedValue(mockUser);

    const result = await service.getUserById(userId);

    expect(mockUserRepository.findOne).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });
});
