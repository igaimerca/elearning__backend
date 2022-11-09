import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from './file.controller';

describe('FileController', () => {
  let service: FileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileController],
    }).compile();

    service = module.get<FileController>(FileController);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
