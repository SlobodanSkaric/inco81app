import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { Users } from 'entitets/entities/Users';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock } from 'node:test';
import { Customers } from 'entitets/entities/Customers';
import { Administrator } from 'entitets/entities/Administrator';
import { identity } from 'rxjs';
import e from 'express';

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
 
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

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { userId: userId } });      
    expect(result).toEqual(mockUser);
  });

  it("get user by email", async () =>{
    const email = "slobodan.skaric@gmail.com";
    const mockUser = {
        userId: 1,
        name: "Slobodan",
        lastname: "Skaric",
        email: "slobodan.skaric@gmail.com"
      }

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getByEmail(email);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: email } });
      expect(result).toEqual(mockUser);
  });

  it("Add users", async () =>{
      const mockUser = Object.assign(new Users(), {
        userId: 1,
        name: "Slobodan",
        lastname: "Skaric",
        email: "slobodan.skaric@gmail.com",
        phonenumber: "06054544756",
        password: "Password1!",
        role: "user",
        token: null,  
        visibility: 1,
        timeOfWorks: [],
        requestLogs: [],
        vacations: [],
      });

      const mockUserSave = {
        name: "Slobodan",
        lastname: "Skaric",
        email: "slobodan.skaric@gmail.com",
        phonenumber: "06054544756",
        password: "Password1!",
      }

      const mockUserInfoDto = {
        userId: 1,
        name: "Slobodan",
        lastname: "Skaric",
        email: "slobodan.skaric@gmail.com",
        phonenumber: "06054544756",
        timeOfWorks: [],
        sumTimeOfWork: "",
      }

      mockUserRepository.save.mockResolvedValue(mockUser);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.addUser(mockUserSave);


      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        name: mockUser.name,
        lastname: mockUser.lastname,
        email: mockUser.email,
        phonenumber: mockUser.phonenumber,
        password: expect.any(String),
      }));
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: mockUser.email } });

      expect(result).not.toHaveProperty("password");
      expect(result).toMatchObject(mockUserInfoDto);
  });

  it("Delete user", async() =>{//resolve what is the expectes when visibility is set to 1, and set visible expected value to save method
      const mockUser = {
        userId: 1,
        name: "Slobodan",
        lastname: "Skaric",
        email: "slobodan.skaric@gmail.com"
      }

      const mockDeletedUser = {
        user_id: 1,
        visible: 0
      }

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.deleteUser(mockDeletedUser);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { userId: mockDeletedUser.user_id } });
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        ...mockUser,
      }));

      expect(result).toEqual({
        status: "ok",
        code: 0,
        messages: "User successfuly hidden"
      });
  });

  it("Update user", async() =>{});//TODO 
});
