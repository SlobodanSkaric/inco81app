import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ReportService } from './report.service';
import { TimeOfWorke } from 'src/entitets/entities/TimeOfWorke';
import { Users } from 'src/entitets/entities/Users';
import { Role } from 'src/common/enums/role.enum';

let finishCallback: (() => void) | null = null;

var mockWriteStream = {
  on: jest.fn().mockImplementation((event: string, cb: (...args: any[]) => void) => {
    if (event === 'finish') {
      finishCallback = cb as () => void;
    }
    return mockWriteStream;
  }),
};

var mockDoc = {
  pipe: jest.fn().mockReturnThis(),
  fontSize: jest.fn().mockReturnThis(),
  text: jest.fn().mockReturnThis(),
  moveDown: jest.fn().mockReturnThis(),
  end: jest.fn().mockImplementation(() => {
    if (finishCallback) {
      finishCallback();
    }
    return true;
  }),
};

jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');

  return {
    ...actualFs,
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn(),
    createWriteStream: jest.fn().mockImplementation(() => mockWriteStream),
    copyFile: jest.fn().mockImplementation((_src: string, _dest: string, cb: (err: NodeJS.ErrnoException | null) => void) => {
      cb(null);
    }),
  };
});

jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => mockDoc);
});

describe('ReportService', () => {
  let service: ReportService;
  const reportDto = {
    userId: 7,
    adminId: 1,
    startDate: '2026-04-01T00:00:00.000Z',
    endDate: '2026-04-30T23:59:59.999Z',
    format: 'pdf',
  };

  const queryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const timeOfWorkRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
  };

  const userRepository = {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
  };

  const configService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'SERVER_PDF_PATH') return './exports/';
      if (key === 'HOST_MACHINE_PDF_PATH') return './exports/';
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    finishCallback = null;

    mockWriteStream.on.mockImplementation((event: string, cb: (...args: any[]) => void) => {
      if (event === 'finish') {
        finishCallback = cb as () => void;
      }
      return mockWriteStream;
    });
    mockDoc.end.mockImplementation(() => {
      if (finishCallback) {
        finishCallback();
      }
      return true;
    });

    timeOfWorkRepository.createQueryBuilder.mockReturnValue(queryBuilder);
    queryBuilder.where.mockReturnThis();
    queryBuilder.andWhere.mockReturnThis();
    queryBuilder.getMany.mockResolvedValue([]);
    userRepository.findOne.mockResolvedValue({
      userId: 7,
      managerId: 1,
      name: 'Slobodan',
      lastname: 'Skaric',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        {
          provide: getRepositoryToken(TimeOfWorke),
          useValue: timeOfWorkRepository,
        },
        {
          provide: getRepositoryToken(Users),
          useValue: userRepository,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('builds an overlap query for the requested report period', async () => {
    await service.createPdfReport(reportDto, reportDto.adminId, Role.ADMIN);

    expect(timeOfWorkRepository.createQueryBuilder).toHaveBeenCalledWith('time_of_worke');
    expect(queryBuilder.where).toHaveBeenCalledWith('time_of_worke.user_id = :userId', { userId: 7 });
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(1, 'time_of_worke.checked_in IS NOT NULL');
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(2, 'time_of_worke.checked_out IS NOT NULL');
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(3, 'DATE(time_of_worke.checked_in) <= :endDate', {
      endDate: '2026-04-30',
    });
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(4, 'time_of_worke.status = 0');
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(5, 'DATE(time_of_worke.checked_out) >= :startDate', {
      startDate: '2026-04-01',
    });
  });

  it('returns ApiResponse error when user is not managed by admin', async () => {
    userRepository.findOne.mockResolvedValue({ userId: 7, managerId: 99, name: 'A', lastname: 'B' });

    const result = await service.createPdfReport(reportDto, reportDto.adminId, Role.ADMIN);

    expect(result).toEqual(expect.objectContaining({
      status: 'error',
      code: 403,
      messages: 'You are not authorized to generate a report for this user',
    }));
  });

  it('formats working hours in the generated PDF with leading zeros', async () => {
    queryBuilder.getMany.mockResolvedValue([
      {
        checked_in: new Date(2026, 3, 10, 8, 5),
        checked_out: new Date(2026, 3, 10, 16, 9),
        dateAndTime: new Date(2026, 3, 9),
      },
    ]);

    await service.createPdfReport(reportDto, reportDto.adminId, Role.ADMIN);

    expect(mockDoc.text).toHaveBeenCalledWith(
      expect.stringContaining('Pocetak: 08:05 - Zavrsetak: 16:09'),
    );
  });

  it('uses checked_in date instead of dateAndTime in the PDF', async () => {
    const checkedIn = new Date(Date.UTC(2026, 3, 10, 8, 5));
    queryBuilder.getMany.mockResolvedValue([
      {
        checked_in: checkedIn,
        checked_out: new Date(Date.UTC(2026, 3, 10, 16, 9)),
        dateAndTime: new Date(Date.UTC(2026, 3, 9)),
      },
    ]);

    await service.createPdfReport(reportDto, reportDto.adminId, Role.ADMIN);

    expect(mockDoc.text).toHaveBeenCalledWith(
      expect.stringContaining(`Datum: ${checkedIn.toISOString().split('T')[0]}`),
    );
    expect(mockDoc.text).not.toHaveBeenCalledWith(
      expect.stringContaining('Datum: 2026-04-09'),
    );
  });

  it('returns success only after the PDF file is written and copied', async () => {
    const fs = require('fs');
    const result = await service.createPdfReport(reportDto, reportDto.adminId, Role.ADMIN);

    expect(mockDoc.end).toHaveBeenCalled();
    expect(fs.copyFile).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Uspešno kreiran izveštaj' });
  });
});
