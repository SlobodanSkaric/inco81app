import { Test, TestingModule } from '@nestjs/testing';
import { SuperadministratorController } from './superadministrator.controller';

describe('SuperadministratorController', () => {
  let controller: SuperadministratorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperadministratorController],
    }).compile();

    controller = module.get<SuperadministratorController>(SuperadministratorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
