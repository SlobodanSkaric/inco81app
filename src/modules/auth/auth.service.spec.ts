import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from 'entitets/entities/Users';
import { Repository } from 'typeorm';
import { ApiResponse } from 'src/misc/api.response.dto';
import { AuthDto } from './dto/auth.dto';
import { AdministratorService } from '../administrator/administrator.service';
import { SuperadministratorService } from '../superadministrator/superadministrator.service';
import { Administrator } from 'entitets/entities/Administrator';
import { Superadministrator } from 'entitets/entities/Superadministrator';
import { get } from 'http';
import { UserService } from '../user/user.service';
const mockUserRepository = {
  findOne: jest.fn(),
}

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthServiceUsers', () => {
  let  service: AuthService;
  let repositoryUser: Repository<Users>;
  let userService: UserService;
  let administratorService: AdministratorService;
  let repositoryAdministrator: Repository<Administrator>;
  let administratotrService: AdministratorService;
  let superadministratorService: SuperadministratorService;
  let repositorySuperadministrator: Repository<Superadministrator>; 

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService,
        {
          provide: getRepositoryToken(Users),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Administrator),
          useValue: {
            findOne: jest.fn(),
          }
        }
      ],
    }).compile();

     service = module.get<AuthService>(AuthService);
     repositoryUser = module.get<Repository<Users>>(getRepositoryToken(Users));
  });
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });