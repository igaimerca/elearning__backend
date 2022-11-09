/* eslint-disable max-len */
/* eslint-disable max-statements */
import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Roles } from '@prisma/client';

import subjectTypeFromGraphql from './subjectTypeFromGraphql';
import { Announcement } from '../announcement/entities/announcement.entity';
import { Assignment } from '../assignment/entities/assignment.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { CalendarEvent } from '../calendarevent/entities/calendarevent.entity';
import { Course } from '../course/entities/course.entity';
import { District } from '../district/entities/district.entity';
import { Group } from '../group/entities/group.entity';
import { KnowledgeBase } from '../knowledge-base/entities/knowledge-base.entity';
import { Message } from '../message/entities/message.entity';
import { Note } from '../note/entities/note.entity';
import { School } from '../school/entities/school.entity';
import { Suggestion } from '../suggestion/entities/suggestion.entity';
import { User } from '../users/entities/user.entity';
import { BugReport } from '../bug-report/entities/bug-report.entity';
import { Report } from '../report/entities/report.entity';
import { Submission } from '../submission/entities/submission.entity';
import { SchoolsStatistics } from '../school/entities/schoolsStatistics.entity';
import { DistrictsStatistics } from '../district/entities/districtsStatistics.entity';
import { Test } from '../test/entities/test.entity';

export enum Action {
  Manage = 'manage', // wild card for all actions
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export enum DetailSubjects {
  CCSA = 'CCSA',
  CSA = 'CSA',
  PDA = 'PDA',
  DA = 'DA',
  PSA = 'PSA',
  SA = 'SA',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  DISTRICT = 'DISTRICT',
  ALL = 'ALL',
}

export type Subjects =
  | InferSubjects<
    | typeof User
    | typeof District
    | typeof Announcement
    | typeof CalendarEvent
    | typeof School
    | typeof Course
    | typeof Group
    | typeof Assignment
    | typeof Attendance
    | typeof Message
    | typeof KnowledgeBase
    | typeof Suggestion
    | typeof Note
    | typeof BugReport
    | typeof Report
    | typeof Submission
    | typeof SchoolsStatistics
    | typeof DistrictsStatistics
    | typeof Test
  >
  | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {
  defineAbility(user: User) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    // All user can manage their own user account
    can(Action.Manage, User, { id: user.id });
    // All user can create the bug report
    can(Action.Create, BugReport);
    // All user can create the calendar event
    can(Action.Create, CalendarEvent);
    // All user can create the report
    can(Action.Create, Report);
    // All user can create the suggestion
    can(Action.Create, Suggestion);
    if (user.role === Roles.CCSA) {
      // CCSA can manage all users
      can(Action.Manage, User);
      // CCSA can manage all schools
      can(Action.Manage, School);
      // CCSA can create the announcement
      can(Action.Create, Announcement);
      // CCSA can manage all districts
      can(Action.Manage, District);
      // CCSA can manage all bug report
      can(Action.Manage, BugReport);
      // CCSA can manage all attendance
      can(Action.Manage, Attendance);
      // CCSA can manage all course
      can(Action.Manage, Course);
      // CCSA can manage all assignment
      can(Action.Manage, Assignment);
      // CCSA can manage all report
      can(Action.Manage, Report);
      // CCSA can manage all suggestion
      can(Action.Manage, Suggestion);
      // CCSA can manage all SchoolsStatistics
      can(Action.Manage, SchoolsStatistics);
      // CSA can manage all DistrictsStatistics
      can(Action.Manage, DistrictsStatistics);
    } else if (user.role === Roles.CSA) {
      // CSA can manage all users except CSA, CCSA
      can(Action.Manage, User, { role: Roles.PDA });
      can(Action.Manage, User, { role: Roles.DA });
      can(Action.Manage, User, { role: Roles.PSA });
      can(Action.Manage, User, { role: Roles.SA });
      can(Action.Manage, User, { role: Roles.PDA });
      can(Action.Manage, User, { role: Roles.DA });
      can(Action.Manage, User, { role: Roles.TEACHER });
      can(Action.Manage, User, { role: Roles.STUDENT });
      can(Action.Manage, User, { role: Roles.PARENT });
      // CSA can manage all schools
      can(Action.Manage, School);
      // CSA can create the announcement
      can(Action.Create, Announcement);
      // CSA can manage all districts
      can(Action.Manage, District);
      // CSA can manage all bug report
      can(Action.Manage, BugReport);
      // CSA can manage all attendance
      can(Action.Manage, Attendance);
      // CSA can manage all course
      can(Action.Manage, Course);
      // CSA can manage all assignment
      can(Action.Manage, Assignment);
      // CSA can manage all report
      can(Action.Manage, Report);
      // CSA can manage all suggestion
      can(Action.Manage, Suggestion);
      // CSA can manage all SchoolsStatistics
      can(Action.Manage, SchoolsStatistics);
      // CSA can manage all DistrictsStatistics
      can(Action.Manage, DistrictsStatistics);
    } else if (user.role === Roles.PDA) {
      // PDA can manage any user in their district
      can(Action.Manage, User, { role: Roles.DA, districtId: user.districtId });
      can(Action.Manage, User, {
        role: Roles.PSA,
        districtId: user.districtId,
      });
      can(Action.Manage, User, { role: Roles.SA, districtId: user.districtId });
      can(Action.Manage, User, {
        role: Roles.TEACHER,
        districtId: user.districtId,
      });
      can(Action.Manage, User, {
        role: Roles.STUDENT,
        districtId: user.districtId,
      });
      can(Action.Manage, User, {
        role: Roles.PARENT,
        districtId: user.districtId,
      });
      // PDA can manage any school in their district
      can(Action.Manage, School, { districtId: user.districtId });
      // PDA can create the announcement
      can(Action.Create, Announcement);
      // PDA can create an attendance
      can(Action.Create, Attendance);
      // PDA can create a course
      can(Action.Create, Course);
      // PDA can create an assignment
      can(Action.Create, Assignment);
    } else if (user.role === Roles.DA) {
      // DA can manage any user in their district
      can(Action.Manage, User, {
        role: Roles.PSA,
        districtId: user.districtId,
      });
      can(Action.Manage, User, { role: Roles.SA, districtId: user.districtId });
      can(Action.Manage, User, {
        role: Roles.TEACHER,
        districtId: user.districtId,
      });
      can(Action.Manage, User, {
        role: Roles.STUDENT,
        districtId: user.districtId,
      });
      can(Action.Manage, User, {
        role: Roles.PARENT,
        districtId: user.districtId,
      });
      // DA can create school
      can(Action.Create, School);
      // DA can manage any school in their district
      can(Action.Manage, School, { districtId: user.districtId });
      // DA can create the announcement
      can(Action.Create, Announcement);
      // DA can create an attendance
      can(Action.Create, Attendance);
      // DA can create a course
      can(Action.Create, Course);
      // DA can create an assignment
      can(Action.Create, Assignment);
    } else if (user.role === Roles.PSA) {
      // PSA can manage any user in their school
      can(Action.Manage, User, { role: Roles.SA, schoolId: user.schoolId });
      can(Action.Manage, User, {
        role: Roles.TEACHER,
        schoolId: user.schoolId,
      });
      can(Action.Manage, User, {
        role: Roles.STUDENT,
        schoolId: user.schoolId,
      });
      can(Action.Manage, User, { role: Roles.PARENT, schoolId: user.schoolId });
      // PSA can read/update their school
      can(Action.Read, School, { id: user.schoolId });
      can(Action.Update, School, { id: user.schoolId });
      // PSA can create the announcement
      can(Action.Create, Announcement);
      // PSA can create an attendance
      can(Action.Create, Attendance);
      // PSA can create a course
      can(Action.Create, Course);
      // PSA can create an assignment
      can(Action.Create, Assignment);
    } else if (user.role === Roles.SA) {
      // Only a SA can manage a course
      can(Action.Manage, Course);
      // Only a SA can manage a teacher
      can(Action.Manage, User, {
        role: Roles.TEACHER,
        schoolId: user.schoolId,
      });
      // Only a SA can manage a student
      can(Action.Manage, User, {
        role: Roles.STUDENT,
        schoolId: user.schoolId,
      });
      // Only a SA can manage a parent
      can(Action.Manage, User, { role: Roles.PARENT, schoolId: user.schoolId });
      // SA can read/update their school
      can(Action.Read, School, { id: user.schoolId });
      can(Action.Update, School, { id: user.schoolId });
      // SA can create the announcement
      can(Action.Create, Announcement);
      // SA can create an attendance
      can(Action.Create, Attendance);
      // SA can create a course
      can(Action.Create, Course);
      // SA can create an assignment
      can(Action.Create, Assignment);
    } else if (user.role === Roles.TEACHER) {
      // Teacher can read their school
      can(Action.Read, School, { id: user.schoolId });
      // Teacher can create the announcement
      can(Action.Create, Announcement);
      // Teacher can create an attendance
      can(Action.Create, Attendance);
      // Teacher can create an assignment
      can(Action.Create, Assignment);
      // Teacher can create an test
      can(Action.Create, Test);
    } else if (user.role === Roles.STUDENT) {
      // Student can read their school
      can(Action.Read, School, { id: user.schoolId });
      // Student can create the submission
      can(Action.Create, Submission);
      // Student can update the submission
      can(Action.Update, Submission);
      // Student can delete the submission
      can(Action.Delete, Submission);
    } else if (user.role === Roles.PARENT) {
      // Parent can read their children's school
      const childrenSchoolIds = user.children.map(
        (parentChild) => parentChild.child.schoolId,
      );
      can(Action.Read, School, { id: { $in: childrenSchoolIds } });
    }

    return build({
      detectSubjectType: subjectTypeFromGraphql,
    });
  }
}
