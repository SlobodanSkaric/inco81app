import { Test, TestingModule } from '@nestjs/testing';
import { JobinformationsService } from './jobinformations.service';
import { JobInformations } from 'src/entitets/entities/JobInformations';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from 'src/entitets/entities/Users';
import { Role } from 'src/common/enums/role.enum';
import { ApiResponse } from 'src/misc/api.response.dto';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

const mockJobinformationsRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockUsersRepository = {
  findOne: jest.fn(),
};

const overlapQb = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getOne: jest.fn().mockResolvedValue(null),
};

const mockTxManager = {
  findOne: jest.fn(),
  getRepository: jest.fn().mockReturnValue({
    createQueryBuilder: jest.fn().mockReturnValue(overlapQb),
  }),
  save: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn(async (cb: (manager: typeof mockTxManager) => unknown) => cb(mockTxManager)),
};

describe('JobinformationsService', () => {
  let service: JobinformationsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobinformationsService,
        {
          provide: getRepositoryToken(JobInformations),
          useValue: mockJobinformationsRepository,
        },
        {
          provide: getRepositoryToken(Users),
          useValue: mockUsersRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<JobinformationsService>(JobinformationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('gets job informations for a user', async () => {
    const mockJobinfos = [{ jobInfoId: 1, jobTitle: 'Software Engineer' }];
    const qb = {
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockJobinfos),
    };
    mockJobinformationsRepository.createQueryBuilder.mockReturnValue(qb);

    const jobInfo = await service.findAllJob(10, Role.USER);

    expect(jobInfo).toEqual(mockJobinfos);
    expect(qb.where).toHaveBeenCalledWith('job.user_id = :requesterId', { requesterId: 10 });
  });

  it('gets job information by id with ownership for user', async () => {
    const mockJobInfo = { jobInfoId: 1, userId: 10, jobTitle: 'Software Engineer' };
    mockJobinformationsRepository.findOne.mockResolvedValueOnce(mockJobInfo);

    const jobInfo = await service.getJobById(1, 10, Role.USER);

    expect(jobInfo).toStrictEqual(mockJobInfo);
  });

  it('rejects job information by id for another user', async () => {
    mockJobinformationsRepository.findOne.mockResolvedValueOnce({ jobInfoId: 1, userId: 99 });

    const jobInfo = await service.getJobById(1, 10, Role.USER);

    expect(jobInfo).toBeInstanceOf(ApiResponse);
    expect((jobInfo as ApiResponse).code).toBe(403);
  });

  it('adds job information for a managed employee', async () => {
    const dto = {
      userId: 10,
      jobTitle: 'Software Engineer',
      companyName: 'Tech Corp',
      location: 'New York',
      startDate: '2020-01-01',
      endDate: '2021-01-01',
      jobDescription: 'Developed web applications',
    };

    mockUsersRepository.findOne.mockResolvedValueOnce({
      userId: 10,
      managerId: 1,
      role: Role.USER,
    });
    mockTxManager.findOne.mockResolvedValueOnce({ userId: 10 });
    mockTxManager.save.mockResolvedValueOnce({ jobInfoId: 1, ...dto });
    overlapQb.getOne.mockResolvedValueOnce(null);

    const jobInfo = await service.addJobs(dto, 1);

    expect(mockUsersRepository.findOne).toHaveBeenCalled();
    expect(mockDataSource.transaction).toHaveBeenCalled();
    expect(mockTxManager.save).toHaveBeenCalled();
    expect(jobInfo).toEqual(expect.objectContaining({ jobInfoId: 1 }));
  });
});
