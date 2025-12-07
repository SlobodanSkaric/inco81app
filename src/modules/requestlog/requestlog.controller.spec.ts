import { Test, TestingModule } from '@nestjs/testing';
import { RequestlogController } from './requestlog.controller';

describe('RequestlogController', () => {
  let controller: RequestlogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestlogController],
    }).compile();

    controller = module.get<RequestlogController>(RequestlogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
