import { Test, TestingModule } from '@nestjs/testing';
import { VacationService } from './vacation.service';
import { Vacations } from 'entitets/entities/Vacations';
import { Repository } from 'typeorm';
import { find } from 'rxjs';
import { getRepositoryToken } from '@nestjs/typeorm';
import e from 'express';
import { AddVacationsDto } from './vactions.request.dto.ts/add.vacations.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('VacationService', () => {
  let service: VacationService;
  let respository: Repository<Vacations>

  let mockVacationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn()
  }

  let mockEventEmitter = {
    emit: jest.fn()
  }

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VacationService,
        {
          provide: getRepositoryToken(Vacations),
          useValue: mockVacationRepository
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter
        }
      ],
    }).compile();

    service = module.get<VacationService>(VacationService);
    respository = module.get<Repository<Vacations>>(getRepositoryToken(Vacations));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it("should return all vacations", async () => {
    let mockVacations = [
      {
        vacationId: 1,
        vacation_start: new Date("2024-01-01"),
        vacation_end: new Date("2024-01-10"),
        userId: 1,
        adminId: 1,
        reason: "Vacation reason",
        status: 1,
        created_at: new Date(),
        admin_comment: null,
        user_comment: null
      },
      {
        vacationId: 2,
        vacation_start: new Date("2024-02-01"),
        vacation_end: new Date("2024-02-10"),
        userId: 2,
        adminId: 1,
        reason: "Vacation reason",
        status: 1,
        created_at: new Date(),
        admin_comment: null,
        user_comment: null
      },
      {
        vacationId: 3,
        vacation_start: new Date("2024-03-01"),
        vacation_end: new Date("2024-03-10"),
        userId: 3,
        adminId: 1,
        reason: "Vacation reason",
        status: 1,
        created_at: new Date(),
        admin_comment: null,
        user_comment: null
      }
    ];

    mockVacationRepository.find.mockResolvedValue(mockVacations);

    const result = await service.findAll();

    expect(mockVacationRepository.find).toHaveBeenCalled();
    expect(result).toEqual(mockVacations);

  });

  it("should return vacation by id", async () => {
    const mockVacation = {
      vacationId: 1,
      vacation_start: new Date("2024-01-01"),
      vacation_end: new Date("2024-01-10"),
      userId: 1,
      adminId: 1,
      reason: "Vacation reason",
      status: 1,
      created_at: new Date(),
      admin_comment: null,
      user_comment: null
    };

    mockVacationRepository.findOne.mockResolvedValue(mockVacation);

    const result = await service.findById(1);

    expect(mockVacationRepository.findOne).toHaveBeenCalledWith({ where: { vacationId: 1 } });
    expect(result).toEqual(mockVacation);
  });

  it("should add vacation", async () => {
    const vactionData = new AddVacationsDto();
    vactionData.vacation_start = "2024-01-10 00:00:00";
    vactionData.vacation_end = "2024-01-10 00:00:00";
    vactionData.userId = 1;
    vactionData.admin = 1;
    vactionData.reason = "Vacation reason";
    vactionData.status = 1;
    vactionData.admin_comment = "This is admin comment";
    vactionData.user_comment = "This is user comment";  

    const returnedVacation = new Vacations();
    returnedVacation.vacationId = 1;
    returnedVacation.vacation_start = new Date(vactionData.vacation_start);
    returnedVacation.vacation_end = new Date(vactionData.vacation_end);
    returnedVacation.user = vactionData.userId;
    returnedVacation.admin = vactionData.admin;
    returnedVacation.reason = vactionData.reason;
    returnedVacation.status = vactionData.status;
    returnedVacation.created_at = new Date();
    returnedVacation.admin_comment = vactionData.admin_comment;
    returnedVacation.user_comment = vactionData.user_comment;

    mockVacationRepository.save.mockResolvedValue(returnedVacation);

    const result = await service.addVactions(vactionData);

    expect(mockVacationRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      vacation_start: expect.any(Date),
      vacation_end: expect.any(Date),
      user: vactionData.userId,
      admin: vactionData.admin,
      reason: vactionData.reason,
      status: vactionData.status,
      admin_comment: vactionData.admin_comment,
      user_comment: vactionData.user_comment
    }));

    expect(result).toEqual(returnedVacation);
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('vacation.request.created', {
      requestId: returnedVacation.vacationId,
      userId: returnedVacation.user
    });
  });
});
