import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogResolver } from './audit-log.resolver';
import { AuditLogService } from './audit-log.service';

describe('AuditLogResolver', () => {
  let resolver: AuditLogResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditLogResolver, AuditLogService],
    }).compile();

    resolver = module.get<AuditLogResolver>(AuditLogResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
