import { Test, TestingModule } from '@nestjs/testing';
import { ResultadosService } from './resultados.service.js';

describe('ResultadosService', () => {
  let service: ResultadosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResultadosService],
    }).compile();

    service = module.get<ResultadosService>(ResultadosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
