import { Test, TestingModule } from '@nestjs/testing';
import { RequestlogService } from './requestlog.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RequestLogs } from 'src/entitets/entities/RequestLogs';
import { ConfigService } from '@nestjs/config';

describe('RequestlogService', () => {
  let service: RequestlogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestlogService,
        {
          provide: getRepositoryToken(RequestLogs),
          useValue: { save: jest.fn(), find: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('redis://127.0.0.1:6379') },
        },
      ],
    }).compile();

    service = module.get<RequestlogService>(RequestlogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
