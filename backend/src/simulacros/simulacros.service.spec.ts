import { Test, TestingModule } from '@nestjs/testing';
import { SimulacrosService } from './simulacros.service.js';

describe('SimulacrosService', () => {
  let service: SimulacrosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SimulacrosService],
    }).compile();

    service = module.get<SimulacrosService>(SimulacrosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
