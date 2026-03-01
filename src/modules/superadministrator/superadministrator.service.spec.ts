import { Test, TestingModule } from '@nestjs/testing';
import { SuperadministratorService } from './superadministrator.service';
import { Repository } from 'typeorm';
import { Superadministrator } from 'entitets/entities/Superadministrator';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock } from 'node:test';

const mockSuperadministratorRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
}

describe('SuperadministratorService', () => {
  let service: SuperadministratorService;
  let repository: Repository<Superadministrator> ;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuperadministratorService,
        {
          provide: getRepositoryToken(Superadministrator),
          useValue: mockSuperadministratorRepository
        }
      ],
    }).compile();

    service = module.get<SuperadministratorService>(SuperadministratorService);
    repository = module.get<Repository<Superadministrator>>(getRepositoryToken(Superadministrator));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it("Get adminstraotor by id", async () =>{
   const mockSuperadministrator = {
      superAdmistratorId: 1,
      username : "Slobodan",
      password: "password",
      email: "slobodan.skaric@gmali.com",
      phoneNumber: "06054544756",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockSuperadministratorRepository.findOne.mockResolvedValueOnce(mockSuperadministrator);

    const result = await service.getUserById(1);

    expect(result).toEqual(mockSuperadministrator); 
    expect(mockSuperadministratorRepository.findOne).toHaveBeenCalledWith({ where: { superAdmistratorId: 1 }});

  });

  it("Get administrator by email", async () =>{
     const mockSuperadministrator = {
      superAdmistratorId: 1,
      username : "Slobodan",
      password: "password",
      email: "slobodan.skaric@gmali.com",
      phoneNumber: "06054544756",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockSuperadministratorRepository.findOne.mockResolvedValueOnce(mockSuperadministrator);

    const result = await service.getsuperadministratorsByEmail("slobodan.skaric@gmali.com")

    expect(result).toEqual(mockSuperadministrator);
    expect(mockSuperadministratorRepository.findOne).toHaveBeenCalledWith({ where: { email:"slobodan.skaric@gmali.com"}});
  });


  it("Add new superadministrators", async () =>{
    const mockSuperadministrator = {
      username : "Slobodan",
      password: "password",
      email: "slobodan.skaric@gmail.com",
      phoneNumber: "06054544756",
    }

    mockSuperadministratorRepository.save.mockResolvedValueOnce(mockSuperadministrator);

    const result = await service.addSuperAdministrators(mockSuperadministrator);

    expect(result).toEqual(mockSuperadministrator);
    expect(mockSuperadministratorRepository.save).toHaveBeenCalledWith(expect.objectContaining(
      {
        username: mockSuperadministrator.username,
        email: mockSuperadministrator.email,
        phoneNumber: mockSuperadministrator.phoneNumber,
        password: expect.any(String)
      }
    ));

  });
});
