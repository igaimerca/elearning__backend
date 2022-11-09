import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLError } from 'graphql';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { PermissionModule } from '../src/models/ability/ability.module';
import { AnnouncementModule } from '../src/models/announcement/announcement.module';
import { AssignmentModule } from '../src/models/assignment/assignment.module';
import { AuditLogModule } from '../src/models/audit-log/audit-log.module';
import { BugReportModule } from '../src/models/bug-report/bug-report.module';
import { CalendarEventModule } from '../src/models/calendarevent/calendarevent.module';
import { ClassModule } from '../src/models/class/class.module';
import { CourseModule } from '../src/models/course/course.module';
import { DistrictModule } from '../src/models/district/district.module';
import { ErrorModule } from '../src/models/error/error.module';
import { GroupMessageModule } from '../src/models/group-message/group-message.module';
import { GroupModule } from '../src/models/group/group.module';
import { LiveChatModule } from '../src/models/live-chat/live-chat.module';
import { MessageModule } from '../src/models/message/message.module';
import { QuickInfoModule } from '../src/models/quick-info/quick-info.module';
import { ReportModule } from '../src/models/report/report.module';
import { SchoolModule } from '../src/models/school/school.module';
import { SubmissionModule } from '../src/models/submission/submission.module';
import { SuggestionModule } from '../src/models/suggestion/suggestion.module';
import { TimetableModule } from '../src/models/timetable/timetable.module';
import { UsersModule } from '../src/models/users/users.module';
import { formatErrors } from '../src/utils/errorformatter';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: `.env.${process.env.NODE_ENV}`,
        }),
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: './graphql/schema.gql',
          subscriptions: {
            'graphql-ws': true,
          },
          formatError: (error: GraphQLError) => formatErrors(error),
        }),
        UsersModule,
        DistrictModule,
        SchoolModule,
        CourseModule,
        TimetableModule,
        LiveChatModule,
        ErrorModule,
        AuditLogModule,
        ClassModule,
        AuthModule,
        ReportModule,
        AnnouncementModule,
        SuggestionModule,
        QuickInfoModule,
        CalendarEventModule,
        GroupModule,
        PermissionModule,
        MessageModule,
        AssignmentModule,
        SubmissionModule,
        BugReportModule,
        GroupMessageModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('It should login', async () => {
    const query = `
     query($data: LoginAuthInput!) {
        login(loginData: $data){
          JwtToken
          TfaQrCodeUrl
        }
      }`;

    const variables = {
      data: {
        email: 'test@test.com',
        password: '123456',
      },
    };

    const response = request(app.getHttpServer())
      .post('/graphql')
      .send({ query, variables })
      .expect(200);

    expect((await response).body.data.login.JwtToken).toBeDefined();
  });

  it('It should return TfaQrCodeUrl', async () => {
    const query = `
      query($data: LoginAuthInput!) {
        login(loginData: $data){
          TfaQrCodeUrl
        }
      }`;

    const variables = {
      data: {
        email: 'tfa@gmail.com',
        password: '123456',
      },
    };

    const response = request(app.getHttpServer())
      .post('/graphql')
      .send({ query, variables })
      .expect(200);

    expect((await response).body.data.login.TfaQrCodeUrl).toBeDefined();
  });
});
