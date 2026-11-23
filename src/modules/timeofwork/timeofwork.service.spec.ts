import { Test, TestingModule } from '@nestjs/testing';
import { TimeofworkService } from './timeofwork.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TimeOfWorke } from 'src/entitets/entities/TimeOfWorke';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('TimeofworkService', () => {
  let service: TimeofworkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeofworkService,
        {
          provide: getRepositoryToken(TimeOfWorke),
          useValue: { findOne: jest.fn(), createQueryBuilder: jest.fn() },
        },
        {
          provide: DataSource,
          useValue: { transaction: jest.fn() },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<TimeofworkService>(TimeofworkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
