import { Test, TestingModule } from '@nestjs/testing';
import { VacationService } from './vacation.service';
import { Vacations } from 'src/entitets/entities/Vacations';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AddVacationsDto } from './dto/add.vacations.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { VacationStatus } from './dto/vacation.status.enum';
import { ApiResponse } from 'src/misc/api.response.dto';
import { DataSource } from 'typeorm';

describe('VacationService', () => {
  let service: VacationService;

  const overlapQueryBuilder = {
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    setLock: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(null),
  };

  const mockVacationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(overlapQueryBuilder),
  };

  const mockManager = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    getRepository: jest.fn().mockReturnValue({
      createQueryBuilder: jest.fn().mockReturnValue(overlapQueryBuilder),
    }),
  };

  const mockDataSource = {
    transaction: jest.fn(async (cb: (manager: typeof mockManager) => unknown) => cb(mockManager)),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    overlapQueryBuilder.getOne.mockResolvedValue(null);
    mockManager.findOne.mockResolvedValue({
      userId: 10,
      managerId: 1,
      visibility: 1,
      manager: { email: 'mgr@test.com', visibility: 1 },
    });
    mockManager.create.mockImplementation((_entity, data) => data);
    mockManager.save.mockImplementation(async (entity) =>
      entity.vacationId ? entity : { ...entity, vacationId: 1 },
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VacationService,
        {
          provide: getRepositoryToken(Vacations),
          useValue: mockVacationRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<VacationService>(VacationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return team vacations for manager', async () => {
    const mockVacations = [
      {
        vacationId: 1,
        vacation_start: new Date('2024-01-01'),
        vacation_end: new Date('2024-01-10'),
        reason: 'Vacation reason',
        status: VacationStatus.PENDING,
      },
    ];

    mockVacationRepository.find.mockResolvedValue(mockVacations);

    const result = await service.findAllForManager(1);

    expect(mockVacationRepository.find).toHaveBeenCalledWith({
      where: { user: { managerId: 1, visibility: 1 } },
      relations: { user: true },
      order: { created_at: 'DESC' },
    });
    expect(result).toEqual(mockVacations);
  });

  it('should return vacation by id for user', async () => {
    const mockVacation = {
      vacationId: 1,
      status: VacationStatus.PENDING,
    };

    mockVacationRepository.findOne.mockResolvedValue(mockVacation);

    const result = await service.findById(1, 10);

    expect(mockVacationRepository.findOne).toHaveBeenCalledWith({
      where: { vacationId: 1, user: { userId: 10 } },
    });
    expect(result).toEqual(mockVacation);
  });

  it('should add vacation with pending status', async () => {
    const vactionData = new AddVacationsDto();
    vactionData.vacation_start = '2024-01-10 00:00:00';
    vactionData.vacation_end = '2024-01-12 00:00:00';
    vactionData.reason = 'Vacation reason';
    vactionData.user_comment = 'This is user comment';

    const returnedVacation = {
      vacationId: 1,
      vacation_start: new Date(vactionData.vacation_start),
      vacation_end: new Date(vactionData.vacation_end),
      reason: vactionData.reason,
      status: VacationStatus.PENDING,
      user_comment: vactionData.user_comment,
    };

    mockManager.create.mockReturnValue(returnedVacation);
    mockManager.save.mockResolvedValue(returnedVacation);

    const result = await service.addVactions(vactionData, 10);

    expect(mockManager.create).toHaveBeenCalledWith(
      Vacations,
      expect.objectContaining({
        status: VacationStatus.PENDING,
        user: { userId: 10 },
        reason: vactionData.reason,
      }),
    );
    expect(result).toEqual(returnedVacation);
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      'vacation.request.created',
      expect.objectContaining({
        requestId: returnedVacation.vacationId,
        userId: 10,
        managerEmail: 'mgr@test.com',
      }),
    );
  });

  it('should reject vacation when end is before start', async () => {
    const vactionData = new AddVacationsDto();
    vactionData.vacation_start = '2024-01-12 00:00:00';
    vactionData.vacation_end = '2024-01-10 00:00:00';
    vactionData.reason = 'Vacation reason';

    const result = await service.addVactions(vactionData, 10);

    expect(result).toEqual(
      expect.objectContaining({
        status: 'error',
        code: 400,
      }),
    );
    expect(mockDataSource.transaction).not.toHaveBeenCalled();
  });

  it('should reject vacation when user has no manager', async () => {
    mockManager.findOne.mockResolvedValue({ userId: 10, managerId: null, visibility: 1 });
    const vactionData = new AddVacationsDto();
    vactionData.vacation_start = '2024-01-10 00:00:00';
    vactionData.vacation_end = '2024-01-12 00:00:00';
    vactionData.reason = 'Vacation reason';

    const result = await service.addVactions(vactionData, 10);

    expect(result).toBeInstanceOf(ApiResponse);
    expect((result as ApiResponse).code).toBe(400);
  });
});
