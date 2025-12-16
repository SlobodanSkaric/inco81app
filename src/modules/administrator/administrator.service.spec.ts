import { Test, TestingModule } from '@nestjs/testing';
import { AdministratorService } from './administrator.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Administrator } from 'entitets/entities/Administrator';
import { Repository } from 'typeorm';
import { TimeOfWorke } from 'entitets/entities/TimeOfWorke';

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

    it("Return administrator when ID is valid", async () => {
      const mocAdministrator = { adminId: 1, name: "Slobodan" };

      mockAdministratorsRepositiort.findOne.mockResolvedValue(mocAdministrator);

      const resulte = await service.getById(1);
      expect(resulte).toEqual(mocAdministrator);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { adminId: 1 } });
    });
});