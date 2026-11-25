import { Injectable, NotFoundException } from "@nestjs/common";
import { EnrollmentStatus, MaterialStatus, PostStatus, TestStatus, AttemptStatus } from "@prisma/client";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getForUser(clerkUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        profile: { select: { displayName: true } },
        enrollment: {
          select: {
            status: true,
            university: { select: { id: true, name: true, shortName: true } },
            program: { select: { id: true, name: true } },
            academicLevel: {
              select: {
                id: true,
                name: true,
                semesters: {
                  where: { isActive: true },
                  orderBy: { sortOrder: "asc" },
                  select: { id: true, name: true, sortOrder: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException("Your student account has not been set up yet");

    const enrollment = user.enrollment?.status === EnrollmentStatus.ACTIVE ? user.enrollment : null;
    const displayName = user.profile?.displayName || user.firstName || "Student";

    if (!enrollment) {
      return {
        onboardingComplete: false,
        student: { displayName, avatarUrl: user.avatarUrl },
        academic: null,
        metrics: { courses: 0, newMaterials: 0, completedAttempts: 0, averageScore: null, unreadNotifications: 0 },
        courses: [],
        recentMaterials: [],
        announcements: [],
        community: [],
        practice: { availableTests: 0 },
      };
    }

    const { university, program, academicLevel } = enrollment;
    const latestSemester = academicLevel.semesters.at(-1) ?? null;
    const now = new Date();

    const [offerings, newMaterialCount, recentMaterials, availableTests, completedAttempts, scoreAggregate, unreadNotifications, announcements, posts] = await Promise.all([
      this.prisma.courseOffering.findMany({
        where: {
          academicLevelId: academicLevel.id,
          ...(latestSemester ? { semesterId: latestSemester.id } : {}),
        },
        include: {
          course: { select: { id: true, code: true, title: true, description: true, creditUnits: true, isActive: true } },
          semester: { select: { id: true, name: true, sortOrder: true } },
        },
        orderBy: { course: { title: "asc" } },
      }),
      this.prisma.learningMaterial.count({
        where: { universityId: university.id, programId: program.id, status: MaterialStatus.APPROVED },
      }),
      this.prisma.learningMaterial.findMany({
        where: { universityId: university.id, programId: program.id, status: MaterialStatus.APPROVED },
        select: {
          id: true,
          title: true,
          type: true,
          createdAt: true,
          course: { select: { code: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      this.prisma.test.count({
        where: {
          status: TestStatus.PUBLISHED,
          OR: [{ programId: program.id }, { programId: null }],
        },
      }),
      this.prisma.testAttempt.count({
        where: { userId: user.id, status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.GRADED] } },
      }),
      this.prisma.testAttempt.aggregate({
        where: {
          userId: user.id,
          status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.GRADED] },
          percentage: { not: null },
        },
        _avg: { percentage: true },
      }),
      this.prisma.notification.count({ where: { userId: user.id, readAt: null } }),
      this.prisma.announcement.findMany({
        where: {
          isPublished: true,
          OR: [{ universityId: university.id }, { universityId: null }],
          publishedAt: { lte: now },
        },
        select: { id: true, title: true, content: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
      this.prisma.post.findMany({
        where: {
          status: PostStatus.PUBLISHED,
          author: { is: { enrollment: { is: { universityId: university.id } } } },
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true,
              enrollment: { select: { universityId: true } },
            },
          },
          _count: { select: { comments: true, likes: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

    const courses = offerings
      .filter((offering) => offering.course.isActive)
      .map((offering) => ({
        id: offering.course.id,
        code: offering.course.code,
        title: offering.course.title,
        creditUnits: offering.course.creditUnits,
        semester: offering.semester.name,
      }));

    const community = posts
      .map((post) => ({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        authorName: [post.author.firstName, post.author.lastName].filter(Boolean).join(" ") || "Student",
        authorAvatarUrl: post.author.avatarUrl,
        commentCount: post._count.comments,
        likeCount: post._count.likes,
      }));

    return {
      onboardingComplete: true,
      student: { displayName, avatarUrl: user.avatarUrl },
      academic: {
        university: university.name,
        universityShortName: university.shortName,
        program: program.name,
        level: academicLevel.name,
        semester: latestSemester?.name ?? null,
      },
      metrics: {
        courses: courses.length,
        newMaterials: newMaterialCount,
        completedAttempts,
        averageScore: scoreAggregate._avg.percentage,
        unreadNotifications,
      },
      courses,
      recentMaterials: recentMaterials.map((material) => ({
        id: material.id,
        title: material.title,
        type: material.type,
        createdAt: material.createdAt,
        courseCode: material.course?.code ?? null,
        courseTitle: material.course?.title ?? null,
      })),
      announcements: announcements.map((announcement) => ({
        ...announcement,
        publishedAt: announcement.publishedAt,
      })),
      community,
      practice: { availableTests },
      learningProgress: null,
      schedule: null,
      dataLimitations: [
        "Course progress and recent reading history are not tracked in the database yet.",
        "A calendar/reminder model is not implemented yet.",
      ],
    };
  }
}
