import { Test, TestingModule } from '@nestjs/testing';
import { JobinformationsService } from './jobinformations.service';
import { Repository } from 'typeorm';
import { JobInformations } from 'entitets/entities/JobInformations';
import { getRepositoryToken } from '@nestjs/typeorm';

const mockJobinformationsRepositopry = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
}

describe('JobinformationsService', () => {
  let service: JobinformationsService;
  let repository: Repository<JobInformations>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobinformationsService,
        {
          provide: getRepositoryToken(JobInformations),
          useValue: mockJobinformationsRepositopry
        }
      ],
    }).compile();

    service = module.get<JobinformationsService>(JobinformationsService);
    repository = module.get<Repository<JobInformations>>(getRepositoryToken(JobInformations));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it("Get all job informations", async () =>{
    const mockJobinfos = [
      {
        jobInfoId: 1,
        administratorId: 1,
        jobTitle: "Software Engineer",
        companyName: "Tech Corp",
        location: "New York",
        startDate: new Date("2020-01-01"),
        endDate: new Date("2021-01-01"),
        jobDescription: "Developed web applications"
      },
      {
        jobInfoId: 2,
        administratorId: 1,
        jobTitle: "Software Engineer",
        companyName: "Tech Corp",
        location: "New York",
        startDate: new Date("2020-01-01"),
        endDate: new Date("2021-01-01"),
        jobDescription: "Developed web applications"
      },
      {
        jobInfoId: 3,
        administratorId: 1,
        jobTitle: "Software Engineer",
        companyName: "Tech Corp",
        location: "New York",
        startDate: new Date("2020-01-01"),
        endDate: new Date("2021-01-01"),
        jobDescription: "Developed web applications"
      }
    ];

    mockJobinformationsRepositopry.find.mockResolvedValueOnce(mockJobinfos);

    const jobInfo = await service.findAllJob();

    expect(jobInfo).toEqual(mockJobinfos);
    expect(repository.find).toHaveBeenCalledTimes(1);
  });

  it("Get job information by ID", async () =>{
    const mockJobInfo = {
      jobInfoId: 1,
      administratorId: 1,
      jobTitle: "Software Engineer",
      companyName: "Tech Corp",
      location: "New York",
      startDate: new Date("2020-01-01"),
      endDate: new Date("2021-01-01"),
      jobDescription: "Developed web applications"
    }

    mockJobinformationsRepositopry.findOne.mockResolvedValueOnce(mockJobInfo);

    const jobInfo = await service.getJobById(1);
    
    expect(jobInfo).toStrictEqual(mockJobInfo);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { jobInfoId: 1 } });
  });

  it("Add job information", async () =>{
    const mockJobInfo = {
      administratorId: 1,
      jobTitle: "Software Engineer",
      companyName: "Tech Corp",
      location: "New York",
      startDate: "2020-01-01",
      endDate: "2021-01-01",
      jobDescription: "Developed web applications"
    }

    mockJobinformationsRepositopry.save.mockResolvedValueOnce(mockJobInfo);

    const jobInfo = await service.addJobs(mockJobInfo);

    expect(jobInfo).toStrictEqual(mockJobInfo);
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
      administratorId: mockJobInfo.administratorId,
      jobTitle: mockJobInfo.jobTitle,
      companyName: mockJobInfo.companyName,
      location: mockJobInfo.location,
      startDate: new Date(mockJobInfo.startDate),
      endDate: new Date(mockJobInfo.endDate),
      jobDescription: mockJobInfo.jobDescription
    }));
  });
});
