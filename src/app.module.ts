/* eslint-disable max-len */
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { AuthModule } from './auth/auth.module';
import { AbiltiesGuard } from './common/guards/abilities.guard';
import { AuthGuard } from './common/guards/auth.guard';
import { PermissionModule } from './models/ability/ability.module';
import { AddressModule } from './models/address/address.module';
import { AnnouncementModule } from './models/announcement/announcement.module';
import { AssignmentModule } from './models/assignment/assignment.module';
import { AuditLogModule } from './models/audit-log/audit-log.module';
import { BugReportModule } from './models/bug-report/bug-report.module';
import { CalendarEventModule } from './models/calendarevent/calendarevent.module';
import { CourseModule } from './models/course/course.module';
import { DistrictModule } from './models/district/district.module';
import { ErrorModule } from './models/error/error.module';
import { GroupMessageModule } from './models/group-message/group-message.module';
import { GroupModule } from './models/group/group.module';
import { KnowledgeBaseModule } from './models/knowledge-base/knowledge-base.module';
import { LiveChatModule } from './models/live-chat/live-chat.module';
import { MessageModule } from './models/message/message.module';
import { QuickInfoModule } from './models/quick-info/quick-info.module';
import { ReportModule } from './models/report/report.module';
import { SchoolModule } from './models/school/school.module';
import { SubmissionModule } from './models/submission/submission.module';
import { SuggestionModule } from './models/suggestion/suggestion.module';
import { SupportModule } from './models/support/support.module';
import { TimetableModule } from './models/timetable/timetable.module';
import { UsersModule } from './models/users/users.module';
import { formatErrors } from './utils/errorformatter';
import { HealthModule } from './models/health/health.module';
import { FolderModule } from './models/folder/folder.module';
import { FileModule } from './models/file/file.module';
import { FileUploadModule } from './fileUpload/file.module';
import { AttendanceModule } from './models/attendance/attendance.module';
import { TestModule } from './models/test/test.module';
import { GraphqlInterceptor, SentryModule } from '@ntegral/nestjs-sentry';
import { ScheduleModule } from './models/schedule/schedule.module';
import { InterestsAndSkillsModule } from './models/interests-and-skills/interests-and-skills.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationModule } from './models/notification/notification.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DSN,
      debug: process.env.NODE_ENV === 'development' ? true : false,
      environment: process.env.NODE_ENV,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      cors: {
        origin: '*',
        methods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
        credentials: true,
      },
      playground: true,
      introspection: true,
      autoSchemaFile: './graphql/schema.gql',
      installSubscriptionHandlers: true,
      formatError: (error: GraphQLError) => formatErrors(error),
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    UsersModule,
    DistrictModule,
    SchoolModule,
    CourseModule,
    TimetableModule,
    LiveChatModule,
    ErrorModule,
    AuditLogModule,
    AttendanceModule,
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
    AddressModule,
    KnowledgeBaseModule,
    SupportModule,
    HealthModule,
    FolderModule,
    FileModule,
    FileUploadModule,
    TestModule,
    ScheduleModule,
    NotificationModule,
    InterestsAndSkillsModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AbiltiesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: () => new GraphqlInterceptor()
    }
  ],
})
export class AppModule { }
