import { Test, TestingModule } from '@nestjs/testing';
import { CarnetsService } from './carnets.service.js';

describe('CarnetsService', () => {
  let service: CarnetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarnetsService],
    }).compile();

    service = module.get<CarnetsService>(CarnetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
