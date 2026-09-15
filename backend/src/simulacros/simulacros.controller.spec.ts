import { Test, TestingModule } from '@nestjs/testing';
import { SimulacrosController } from './simulacros.controller.js';

describe('SimulacrosController', () => {
  let controller: SimulacrosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SimulacrosController],
    }).compile();

    controller = module.get<SimulacrosController>(SimulacrosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
