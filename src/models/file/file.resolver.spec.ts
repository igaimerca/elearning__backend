import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/database/services/prisma.service';
import { FileResolver } from './file.resolver';
import { FileService } from './file.service';

describe('FileResolver', () => {
  let resolver: FileResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileResolver, FileService,PrismaService],
    }).compile();

    resolver = module.get<FileResolver>(FileResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
