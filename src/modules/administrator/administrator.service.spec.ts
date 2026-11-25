import { Test, TestingModule } from '@nestjs/testing';
import { AdministratorService } from './administrator.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from 'src/entitets/entities/Users';
import { TimeOfWorke } from 'src/entitets/entities/TimeOfWorke';
import { Vacations } from 'src/entitets/entities/Vacations';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { VacationService } from '../vacation/vacation.service';

describe('AdministratorService', () => {
  let service: AdministratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdministratorService,
        { provide: getRepositoryToken(Users), useValue: { find: jest.fn(), findOne: jest.fn(), save: jest.fn() } },
        { provide: getRepositoryToken(TimeOfWorke), useValue: { find: jest.fn(), findOne: jest.fn(), update: jest.fn() } },
        { provide: getRepositoryToken(Vacations), useValue: { find: jest.fn(), findOne: jest.fn(), save: jest.fn() } },
        { provide: EventEmitter2, useValue: { emit: jest.fn(), emitAsync: jest.fn() } },
        { provide: DataSource, useValue: { transaction: jest.fn() } },
        { provide: VacationService, useValue: { hasApprovedOverlap: jest.fn() } },
      ],
    }).compile();

    service = module.get<AdministratorService>(AdministratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
