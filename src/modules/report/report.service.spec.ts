import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ReportService } from './report.service';
import { TimeOfWorke } from 'entitets/entities/TimeOfWorke';
import { Users } from 'entitets/entities/Users';

var mockWriteStream = {
  on: jest.fn(),
};

var mockDoc = {
  pipe: jest.fn().mockReturnThis(),
  fontSize: jest.fn().mockReturnThis(),
  text: jest.fn().mockReturnThis(),
  moveDown: jest.fn().mockReturnThis(),
  end: jest.fn().mockReturnValue(true),
};

jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');

  return {
    ...actualFs,
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn(),
    createWriteStream: jest.fn().mockImplementation(() => mockWriteStream),
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

    timeOfWorkRepository.createQueryBuilder.mockReturnValue(queryBuilder);
    queryBuilder.where.mockReturnThis();
    queryBuilder.andWhere.mockReturnThis();
    queryBuilder.getMany.mockResolvedValue([]);
    userRepository.findOneBy.mockResolvedValue({
      userId: 7,
      name: 'Marko',
      lastname: 'Markovic',
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
    await service.createPdfReport(reportDto);

    expect(timeOfWorkRepository.createQueryBuilder).toHaveBeenCalledWith('time_of_worke');
    expect(queryBuilder.where).toHaveBeenCalledWith('time_of_worke.user_id = :userId', { userId: 7 });
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(1, 'time_of_worke.checked_in IS NOT NULL');
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(2, 'time_of_worke.checked_out IS NOT NULL');
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(3, 'time_of_worke.checked_in <= :endDate', {
      endDate: '2026-04-30T23:59:59.999Z',
    });
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(4, 'time_of_worke.checked_out >= :startDate', {
      startDate: '2026-04-01T00:00:00.000Z',
    });
  });

  it('formats working hours in the generated PDF with leading zeros', async () => {
    queryBuilder.getMany.mockResolvedValue([
      {
        checked_in: new Date(2026, 3, 10, 8, 5),
        checked_out: new Date(2026, 3, 10, 16, 9),
        dateAndTime: new Date(2026, 3, 10),
      },
    ]);

    await service.createPdfReport(reportDto);

    expect(mockDoc.text).toHaveBeenCalledWith(
      expect.stringContaining('Pocetak: 08:05 - Zavrsetak: 16:09'),
    );
  });
});
