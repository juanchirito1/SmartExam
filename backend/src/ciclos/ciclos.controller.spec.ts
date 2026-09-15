import { Test, TestingModule } from '@nestjs/testing';
import { CiclosController } from './ciclos.controller.js';

describe('CiclosController', () => {
  let controller: CiclosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CiclosController],
    }).compile();

    controller = module.get<CiclosController>(CiclosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
