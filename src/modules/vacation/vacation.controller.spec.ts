import { Test, TestingModule } from '@nestjs/testing';
import { VacationController } from './vacation.controller';
import { VacationService } from './vacation.service';

describe('VacationController', () => {
  let controller: VacationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VacationController],
      providers: [
        {
          provide: VacationService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<VacationController>(VacationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});