import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: DataSource, useValue: { transaction: jest.fn() } },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
