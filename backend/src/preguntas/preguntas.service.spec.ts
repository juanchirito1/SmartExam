import { Test, TestingModule } from '@nestjs/testing';
import { PreguntasService } from './preguntas.service.js';

describe('PreguntasService', () => {
  let service: PreguntasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PreguntasService],
    }).compile();

    service = module.get<PreguntasService>(PreguntasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
