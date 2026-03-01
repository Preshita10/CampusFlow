import { PrismaClient, UserRole, RequestCategory, RequestStatus } from '@prisma/client';
import { hashPassword } from '../utils/password';

const prisma = new PrismaClient();

/**
 * Seed script for Phase 1: Auth + RBAC + Roles + Departments
 * Creates departments, programs, and users with password hashes
 */
async function main() {
  console.log('🌱 Seeding database...');

  // Create Departments
  const csDept = await prisma.department.upsert({
    where: { code: 'CS' },
    update: {},
    create: {
      name: 'Computer Science',
      code: 'CS',
      description: 'Department of Computer Science',
    },
  });

  const mathDept = await prisma.department.upsert({
    where: { code: 'MATH' },
    update: {},
    create: {
      name: 'Mathematics',
      code: 'MATH',
      description: 'Department of Mathematics',
    },
  });

  console.log('✅ Created departments');

  // Create Programs
  const csProgram = await prisma.program.upsert({
    where: {
      code_departmentId: {
        code: 'CS-BS',
        departmentId: csDept.id,
      },
    },
    update: {},
    create: {
      name: 'Computer Science - Bachelor of Science',
      code: 'CS-BS',
      departmentId: csDept.id,
    },
  });

  const mathProgram = await prisma.program.upsert({
    where: {
      code_departmentId: {
        code: 'MATH-BS',
        departmentId: mathDept.id,
      },
    },
    update: {},
    create: {
      name: 'Mathematics - Bachelor of Science',
      code: 'MATH-BS',
      departmentId: mathDept.id,
    },
  });

  console.log('✅ Created programs');

  // Create Users with password hashes
  const studentPassword = await hashPassword('student123');
  const advisorPassword = await hashPassword('advisor123');
  const professorPassword = await hashPassword('professor123');
  const deptAdminPassword = await hashPassword('deptadmin123');
  const deanPassword = await hashPassword('dean123');
  const superAdminPassword = await hashPassword('admin123');

  // Student
  const student = await prisma.user.upsert({
    where: { email: 'student@gmu.edu' },
    update: {},
    create: {
      id: '1',
      name: 'John Student',
      email: 'student@gmu.edu',
      passwordHash: studentPassword,
      role: UserRole.STUDENT,
      departmentId: csDept.id,
      programId: csProgram.id,
      isActive: true,
      emailVerified: true,
    },
  });

  // Advisor
  const advisor = await prisma.user.upsert({
    where: { email: 'advisor@gmu.edu' },
    update: {},
    create: {
      id: '2',
      name: 'Jane Advisor',
      email: 'advisor@gmu.edu',
      passwordHash: advisorPassword,
      role: UserRole.ADVISOR,
      departmentId: csDept.id,
      isActive: true,
      emailVerified: true,
    },
  });

  // Professor
  const professor = await prisma.user.upsert({
    where: { email: 'professor@gmu.edu' },
    update: {},
    create: {
      id: '3',
      name: 'Dr. Smith Professor',
      email: 'professor@gmu.edu',
      passwordHash: professorPassword,
      role: UserRole.PROFESSOR,
      departmentId: csDept.id,
      isActive: true,
      emailVerified: true,
    },
  });

  // Department Admin
  const deptAdmin = await prisma.user.upsert({
    where: { email: 'deptadmin@gmu.edu' },
    update: {},
    create: {
      id: '4',
      name: 'Department Admin',
      email: 'deptadmin@gmu.edu',
      passwordHash: deptAdminPassword,
      role: UserRole.DEPT_ADMIN,
      departmentId: csDept.id,
      isActive: true,
      emailVerified: true,
    },
  });

  // Dean
  const dean = await prisma.user.upsert({
    where: { email: 'dean@gmu.edu' },
    update: {},
    create: {
      id: '5',
      name: 'Dr. Dean',
      email: 'dean@gmu.edu',
      passwordHash: deanPassword,
      role: UserRole.DEAN,
      isActive: true,
      emailVerified: true,
    },
  });

  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@gmu.edu' },
    update: {},
    create: {
      id: '6',
      name: 'Super Admin',
      email: 'admin@gmu.edu',
      passwordHash: superAdminPassword,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('✅ Created users');

  // Create sample requests
  const request1 = await prisma.request.upsert({
    where: { id: 'req-1' },
    update: {},
    create: {
      id: 'req-1',
      title: 'Request to Override Prerequisite for CS 662',
      description: 'I would like to request permission to enroll in CS 662 Advanced Graphics without having completed CS 550. I have equivalent experience from my previous institution.',
      status: RequestStatus.SUBMITTED,
      category: RequestCategory.COURSE_OVERRIDE,
      aiSummary: 'Request: Request to Override Prerequisite for CS 662 - I would like to request permission to enroll in CS 662 Advanced Graphics without having completed CS 550. I have equivalent experience from my previous institution.\nStatus: SUBMITTED (assigned to Jane Advisor)\nCourse: CS 662\nDetails: I would like to request permission to enroll in CS 662 Advanced Graphics without having completed CS 550. I have equivalent experience from my previous institution.',
      createdById: student.id,
      assignedToId: advisor.id,
    },
  });

  const request2 = await prisma.request.upsert({
    where: { id: 'req-2' },
    update: {},
    create: {
      id: 'req-2',
      title: 'Late Add Request for MATH 101',
      description: 'I need to add MATH 101 to my schedule after the add deadline due to a scheduling conflict that was just resolved.',
      status: RequestStatus.IN_REVIEW,
      category: RequestCategory.ADD_DROP,
      aiSummary: 'Request: Late Add Request for MATH 101 - I need to add MATH 101 to my schedule after the add deadline due to a scheduling conflict that was just resolved.\nStatus: IN_REVIEW (assigned to Jane Advisor)\nCourse: MATH 101\nDetails: I need to add MATH 101 to my schedule after the add deadline due to a scheduling conflict that was just resolved.',
      createdById: student.id,
      assignedToId: advisor.id,
    },
  });

  console.log('✅ Created sample requests');

  // Create sample comments
  await prisma.comment.upsert({
    where: { id: 'comment-1' },
    update: {},
    create: {
      id: 'comment-1',
      requestId: request1.id,
      authorId: advisor.id,
      message: 'Thank you for your request. I will review your transcript and get back to you within 2 business days.',
    },
  });

  console.log('✅ Created sample comments');

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        requestId: request1.id,
        actorId: student.id,
        action: 'REQUEST_CREATED',
        meta: {},
      },
      {
        requestId: request1.id,
        actorId: student.id,
        action: 'ASSIGNMENT_CHANGED',
        meta: { assignedToId: advisor.id },
      },
      {
        requestId: request2.id,
        actorId: student.id,
        action: 'REQUEST_CREATED',
        meta: {},
      },
      {
        requestId: request2.id,
        actorId: student.id,
        action: 'ASSIGNMENT_CHANGED',
        meta: { assignedToId: advisor.id },
      },
      {
        requestId: request2.id,
        actorId: advisor.id,
        action: 'STATUS_CHANGED',
        meta: { from: 'SUBMITTED', to: 'IN_REVIEW' },
      },
      {
        requestId: request1.id,
        actorId: advisor.id,
        action: 'COMMENT_ADDED',
        meta: { commentId: 'comment-1' },
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Created audit logs');

  console.log('\n🎉 Seeding completed!');
  console.log('\nDemo Users (all passwords are "role123"):');
  console.log('  Student:      student@gmu.edu / student123');
  console.log('  Advisor:      advisor@gmu.edu / advisor123');
  console.log('  Professor:    professor@gmu.edu / professor123');
  console.log('  Dept Admin:   deptadmin@gmu.edu / deptadmin123');
  console.log('  Dean:         dean@gmu.edu / dean123');
  console.log('  Super Admin:  admin@gmu.edu / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
