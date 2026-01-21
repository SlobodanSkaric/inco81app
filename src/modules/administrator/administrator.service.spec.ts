import { Test, TestingModule } from '@nestjs/testing';
import { AdministratorService } from './administrator.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Administrator } from 'entitets/entities/Administrator';
import { Repository } from 'typeorm';
import { TimeOfWorke } from 'entitets/entities/TimeOfWorke';
import { ApiResponse } from 'src/misc/api.response.dto';

const mockAdministratorsRepositiort = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
}

const mockTimeOfWork = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
}


describe('AdministratorService', () => {
  let service: AdministratorService;
  let repository: Repository<Administrator>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdministratorService,
        {
          provide: getRepositoryToken(Administrator), 
          useValue: mockAdministratorsRepositiort,
        },{
          provide: getRepositoryToken(TimeOfWorke), 
          useValue: mockTimeOfWork,
        }
      ],
    }).compile();

    service = module.get<AdministratorService>(AdministratorService);
    repository = module.get<Repository<Administrator>>(getRepositoryToken(Administrator));
});


    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it("Get  all administrators", async () =>{
      const mockAdministrators = [
        {
          adminId: 1,
          name: "Slobodan1",
          lastname: "Skaric1",
          email: "slobodan.skaric1@gmail.com",
          phonenumber:"06054544756",
        },{
          adminId: 2,
          name: "Slobodan2",
          lastname: "Skaric2",
          email: "slobodan.skaric2@gmail.com",
          phonenumber:"060545447567",
        },
        {
          adminId: 3,
          name: "Slobodan3",
          lastname: "Skaric3",
          email: "slobodan.skaric3@gmail.com",
          phonenumber:"0605454475677",
        },
      ];

      mockAdministratorsRepositiort.find.mockResolvedValue(mockAdministrators);

      const result = await service.getAllAdmin();
      expect(result).toEqual(mockAdministrators);
      expect(repository.find).toHaveBeenCalled();
    });

    it("Get administrator by email", async () => {
      const mockAdministator = {
        adminId: 1,
        name: "Slobodan",
        lastname: "Skaric",
        email: "slobodan.skaric@gmail.com"
      }

      mockAdministratorsRepositiort.findOne.mockResolvedValue(mockAdministator);

      const resulte = await service.getByEmail("slobodan.skaric@gmail.com");
      expect(resulte).toEqual(mockAdministator);
      expect(repository.findOne).toHaveBeenCalledWith({ where : { email: mockAdministator.email} });
    });

    it("Return administrator when ID is valid", async () => {
      const mocAdministrator = { adminId: 1, name: "Slobodan" };

      mockAdministratorsRepositiort.findOne.mockResolvedValue(mocAdministrator);

      const resulte = await service.getById(1);
      expect(resulte).toEqual(mocAdministrator);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { adminId: 1 } });
    });

    it("Add administrator", async () => {
      const mocklAdministrator = {
        adminId: 1,
        name: "Slobodan", 
        lastname: "Skaric",
        email: "slobodan.skaric@gmail,com",
        phonenumber: "06054544756",
        password: "Password1!"
      }

      const mockAdministratorGetById = {
        adminId: 1,
        name: "Slobodan", 
        lastname: "Skaric",
        email: "slobodan.skaric@gmail.com",
        phonenumber: "06054544756",
      }

      mockAdministratorsRepositiort.save.mockResolvedValue( mocklAdministrator );
      mockAdministratorsRepositiort.findOne.mockResolvedValue( mockAdministratorGetById );

      const resulte = await service.addAdministratorServices(mocklAdministrator);

      expect(resulte).toEqual(mockAdministratorGetById);
      expect(repository.save).toHaveBeenCalledWith( expect.objectContaining({
        name: mocklAdministrator.name,
        lastname: mocklAdministrator.lastname,
        email: mocklAdministrator.email,
        phonenumber: mocklAdministrator.phonenumber,
        password: expect.any(String),
      }) );
    });

    it("Should return ApiResponse error if administrator does not exist" , async () => {
      mockAdministratorsRepositiort.findOne.mockResolvedValue(null);

      const resulte = await service.getById(999);

      expect(resulte).toBeInstanceOf(ApiResponse);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { adminId: 999 } });
    });

    it("Should return null if administrator email does not exist", async () => {
      mockAdministratorsRepositiort.findOne.mockResolvedValue(null);

      const result = await service.getByEmail("slobodan@gmail.com");
      expect(result).toBeNull();
      expect(repository.findOne).toHaveBeenCalledWith({ where : { email: "slobodan@gmail.com"} });
    });

    //Imlement test for time of worke entity
});