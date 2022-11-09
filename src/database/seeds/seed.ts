/* eslint-disable max-statements */
import faker from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { hash } from '../../utils/password';

const prisma = new PrismaClient();

async function main() {
  await prisma.parentChild.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.school.deleteMany({});
  await prisma.district.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.course.deleteMany({});


  const address = await prisma.address.create({
    data: {
      street: faker.address.streetAddress(),
      city: faker.address.city(),
      state: faker.address.state(),
      zipCode: faker.address.zipCode(),
      country: faker.address.country(),
      number: 0,
    },
  });

  // create district
  const district = await prisma.district.create({
    data: {
      name: faker.address.city(),
      address: {
        connect: {
          id: address.id,
        },
      },
    },
  });

  // create CCSA
  const password = await hash('CSA@2022');
  await prisma.user.create({
    data: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phone: faker.phone.phoneNumber(),
      email: 'ccsa-admin@gmail.com',
      password,
      profileAvailability: 'PUBLIC',
      role: 'CCSA'
    },
  });

  await prisma.user.create({
    data: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phone: faker.phone.phoneNumber(),
      email: 'csa-admin@gmail.com',
      profileAvailability: 'PUBLIC',
      password,
      role: 'CSA'
    },
  });

  await prisma.user.create({
    data: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phone: faker.phone.phoneNumber(),
      email: 'pda-admin@gmail.com',
      password,
      role: 'PDA',
      districtId: district.id,
    },
  });

  await prisma.user.create({
    data: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phone: faker.phone.phoneNumber(),
      email: 'da-admin@gmail.com',
      password,
      role: 'DA',
      districtId: district.id,
    },
  });

  const schoolAddress = await prisma.address.create({
    data: {
      street: faker.address.streetAddress(),
      city: faker.address.city(),
      state: faker.address.state(),
      zipCode: faker.address.zipCode(),
      country: faker.address.country(),
      number: 0,
    },
  });

  const school = await prisma.school.create({
    data: {
      name: faker.company.companyName(),
      address: {
        connect: {
          id: schoolAddress.id,
        },
      },
      district: {
        connect: {
          id: district.id,
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phone: faker.phone.phoneNumber(),
      email: 'psa-admin@gmail.com',
      password,
      role: 'PSA',
      districtId: district.id,
      schoolId: school.id,
    },
  });

  await prisma.user.create({
    data: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phone: faker.phone.phoneNumber(),
      email: 'sa-admin@gmail.com',
      password,
      role: 'SA',
      districtId: district.id,
      schoolId: school.id,
    },
  });

  await prisma.user.create({
    data: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phone: faker.phone.phoneNumber(),
      email: 'teacher@gmail.com',
      password,
      role: 'TEACHER',
      districtId: district.id,
      schoolId: school.id,
    },
  });

  const student = await prisma.user.create({
    data: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phone: faker.phone.phoneNumber(),
      email: 'student@gmail.com',
      password,
      role: 'STUDENT',
      districtId: district.id,
      schoolId: school.id,
    },
  });

  await prisma.user.create({
    data: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phone: faker.phone.phoneNumber(),
      email: 'abiheloaf@gmail.com',
      password,
      role: 'STUDENT',
      districtId: district.id,
      schoolId: school.id,
    },
  });

  const parent = await prisma.user.create({
    data: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phone: faker.phone.phoneNumber(),
      email: 'parent@gmail.com',
      password,
      role: 'PARENT',
      districtId: district.id,
      schoolId: school.id,
    },
  });

  const parentAddress = await prisma.address.create({
    data: {
      street: faker.address.streetAddress(),
      city: faker.address.city(),
      state: faker.address.state(),
      zipCode: faker.address.zipCode(),
      country: faker.address.country(),
      number: 0,
    },
  });

  await prisma.parentChild.create({
    data: {
      addressId: parentAddress.id,
      parentId: parent.id,
      childId: student.id,
      relationship: 'MOTHER',
    },
  });

  // await prisma.course.create({
  //   data: {
  //     name: faker.name.jobType(),
  //     courseCode: faker.random.alphaNumeric(),
  //     description: faker.lorem.sentence(),

  //   },
  // });
}

main()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit();
  });
