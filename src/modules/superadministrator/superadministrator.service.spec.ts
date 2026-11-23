import { Test, TestingModule } from '@nestjs/testing';
import { SuperadministratorService } from './superadministrator.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from 'src/entitets/entities/Users';

describe('SuperadministratorService', () => {
  let service: SuperadministratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperadministratorService,
        {
          provide: getRepositoryToken(Users),
          useValue: { findOne: jest.fn(), save: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<SuperadministratorService>(SuperadministratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
