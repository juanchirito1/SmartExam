import { Test, TestingModule } from '@nestjs/testing';
import { CarnetsController } from './carnets.controller.js';

describe('CarnetsController', () => {
  let controller: CarnetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarnetsController],
    }).compile();

    controller = module.get<CarnetsController>(CarnetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
