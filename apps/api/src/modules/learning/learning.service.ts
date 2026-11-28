import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { SubmitLearningMaterialInput } from "@visora/shared";
import { EnrollmentStatus, MaterialStatus, MaterialType } from "@prisma/client";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class LearningService {
  constructor(private readonly prisma: PrismaService) {}

  private async loadContext(clerkUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
      select: {
        id: true,
        firstName: true,
        profile: { select: { displayName: true } },
        enrollment: {
          select: {
            status: true,
            universityId: true,
            programId: true,
            academicLevelId: true,
            university: { select: { name: true, shortName: true } },
            program: { select: { name: true } },
            academicLevel: {
              select: {
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
    return { user, enrollment };
  }

  private async requireEnrollment(clerkUserId: string) {
    const context = await this.loadContext(clerkUserId);
    if (!context.enrollment) throw new BadRequestException("Complete academic onboarding to access your learning library");
    return {
      ...context,
      enrollment: context.enrollment,
      semester: context.enrollment.academicLevel.semesters.at(-1) ?? null,
    };
  }

  private currentOfferingWhere(academicLevelId: string, semesterId: string | null) {
    return { academicLevelId, ...(semesterId ? { semesterId } : {}) };
  }

  private async getCurrentCourseIds(academicLevelId: string, semesterId: string | null) {
    const offerings = await this.prisma.courseOffering.findMany({
      where: this.currentOfferingWhere(academicLevelId, semesterId),
      select: { courseId: true, course: { select: { isActive: true } } },
    });
    return offerings.filter((offering) => offering.course.isActive).map((offering) => offering.courseId);
  }

  async getOverview(clerkUserId: string) {
    const context = await this.loadContext(clerkUserId);
    const displayName = context.user.profile?.displayName || context.user.firstName || "Student";

    if (!context.enrollment) {
      return {
        onboardingComplete: false,
        student: { displayName },
        academic: null,
        metrics: { courses: 0, newMaterials: 0 },
        courses: [],
        recentMaterials: [],
        savedMaterials: [],
        submissions: [],
      };
    }

    const enrollment = context.enrollment;
    const semester = enrollment.academicLevel.semesters.at(-1) ?? null;
    const offerings = await this.prisma.courseOffering.findMany({
      where: this.currentOfferingWhere(enrollment.academicLevelId, semester?.id ?? null),
      include: {
        course: {
          select: {
            id: true,
            code: true,
            title: true,
            description: true,
            creditUnits: true,
            isActive: true,
            topics: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
              select: { id: true, title: true, description: true, sortOrder: true },
            },
          },
        },
        semester: { select: { id: true, name: true } },
      },
      orderBy: { course: { title: "asc" } },
    });
    const activeOfferings = offerings.filter((offering) => offering.course.isActive);
    const courseIds = activeOfferings.map((offering) => offering.course.id);
    const topics = activeOfferings.flatMap((offering) => offering.course.topics.map((topic) => ({ ...topic, courseId: offering.course.id })));
    const topicIds = topics.map((topic) => topic.id);
    const recentMaterialsPromise = this.getRecentForStudent(context.user.id, enrollment);
    const savedMaterialsPromise = this.getSavedForStudent(context.user.id, enrollment);
    const submissionsPromise = this.getSubmissionsForStudent(context.user.id);
    const [approvedMaterials, recentMaterials, savedMaterials, submissions, newMaterialCount] = await Promise.all([
      courseIds.length
        ? this.prisma.learningMaterial.findMany({
            where: {
              universityId: enrollment.universityId,
              programId: enrollment.programId,
              status: MaterialStatus.APPROVED,
              OR: [
                { courseId: { in: courseIds } },
                ...(topicIds.length ? [{ topicId: { in: topicIds } }] : []),
              ],
            },
            select: { id: true, courseId: true, topicId: true },
          })
        : Promise.resolve([]),
      recentMaterialsPromise,
      savedMaterialsPromise,
      submissionsPromise,
      this.prisma.learningMaterial.count({
        where: {
          universityId: enrollment.universityId,
          programId: enrollment.programId,
          status: MaterialStatus.APPROVED,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    const topicCourse = new Map(topics.map((topic) => [topic.id, topic.courseId]));
    const savedIds = new Set(savedMaterials.map((material) => material.id));
    const recentlyViewedCourseIds = new Set(
      recentMaterials.map((material) => material.courseId ?? (material.topicId ? topicCourse.get(material.topicId) : undefined)).filter((id): id is string => Boolean(id)),
    );
    const courses = activeOfferings.map(({ course, semester: courseSemester }) => {
      const courseMaterials = approvedMaterials.filter((material) =>
        material.courseId === course.id || (material.topicId ? topicCourse.get(material.topicId) === course.id : false),
      );
      return {
        id: course.id,
        code: course.code,
        title: course.title,
        description: course.description,
        creditUnits: course.creditUnits,
        semester: courseSemester.name,
        topicCount: course.topics.length,
        materialCount: courseMaterials.length,
        savedMaterialCount: courseMaterials.filter((material) => savedIds.has(material.id)).length,
        recentlyViewed: recentlyViewedCourseIds.has(course.id),
      };
    });

    return {
      onboardingComplete: true,
      student: { displayName },
      academic: {
        university: enrollment.university.name,
        universityShortName: enrollment.university.shortName,
        program: enrollment.program.name,
        level: enrollment.academicLevel.name,
        semester: semester?.name ?? null,
      },
      metrics: { courses: courses.length, newMaterials: newMaterialCount },
      courses,
      recentMaterials,
      savedMaterials,
      submissions,
    };
  }

  async getCourse(clerkUserId: string, courseId: string) {
    const { user, enrollment, semester } = await this.requireEnrollment(clerkUserId);
    const offering = await this.prisma.courseOffering.findFirst({
      where: {
        courseId,
        ...this.currentOfferingWhere(enrollment.academicLevelId, semester?.id ?? null),
        course: { isActive: true },
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            title: true,
            description: true,
            creditUnits: true,
            topics: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
              select: { id: true, title: true, description: true, sortOrder: true },
            },
          },
        },
        semester: { select: { name: true } },
      },
    });
    if (!offering) throw new NotFoundException("Course not found in your current study plan");

    const topicIds = offering.course.topics.map((topic) => topic.id);
    const materials = await this.prisma.learningMaterial.findMany({
      where: {
        universityId: enrollment.universityId,
        programId: enrollment.programId,
        status: MaterialStatus.APPROVED,
        OR: [{ courseId }, ...(topicIds.length ? [{ topicId: { in: topicIds } }] : [])],
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        createdAt: true,
        courseId: true,
        topicId: true,
        course: { select: { code: true, title: true } },
        topic: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    const saved = await this.prisma.materialSave.findMany({
      where: { userId: user.id, materialId: { in: materials.map((material) => material.id) } },
      select: { materialId: true },
    });
    const savedIds = new Set(saved.map((entry) => entry.materialId));
    const withSaveState = materials.map((material) => ({
      ...material,
      courseCode: material.course?.code ?? null,
      courseTitle: material.course?.title ?? null,
      topicTitle: material.topic?.title ?? null,
      isSaved: savedIds.has(material.id),
    }));

    return {
      course: {
        id: offering.course.id,
        code: offering.course.code,
        title: offering.course.title,
        description: offering.course.description,
        creditUnits: offering.course.creditUnits,
        semester: offering.semester.name,
      },
      topics: offering.course.topics.map((topic) => ({
        ...topic,
        materials: withSaveState.filter((material) => material.topicId === topic.id),
      })),
      uncategorizedMaterials: withSaveState.filter((material) => !material.topicId),
    };
  }

  private async getAccessibleMaterial(clerkUserId: string, materialId: string) {
    const { enrollment, semester } = await this.requireEnrollment(clerkUserId);
    const material = await this.prisma.learningMaterial.findFirst({
      where: {
        id: materialId,
        universityId: enrollment.universityId,
        programId: enrollment.programId,
        status: MaterialStatus.APPROVED,
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        createdAt: true,
        externalUrl: true,
        courseId: true,
        topicId: true,
        course: { select: { code: true, title: true } },
        topic: { select: { id: true, title: true, courseId: true, isActive: true } },
      },
    });
    if (!material) throw new NotFoundException("Learning material not found");

    const offerings = await this.prisma.courseOffering.findMany({
      where: this.currentOfferingWhere(enrollment.academicLevelId, semester?.id ?? null),
      select: { courseId: true, course: { select: { isActive: true } } },
    });
    const courseIds = new Set(offerings.filter((offering) => offering.course.isActive).map((offering) => offering.courseId));
    if (material.courseId && !courseIds.has(material.courseId)) throw new NotFoundException("Learning material not found");
    if (material.topicId && (!material.topic?.isActive || !courseIds.has(material.topic.courseId) || (material.courseId && material.courseId !== material.topic.courseId))) {
      throw new NotFoundException("Learning material not found");
    }
    return material;
  }

  async getMaterial(clerkUserId: string, materialId: string) {
    const [material, context] = await Promise.all([
      this.getAccessibleMaterial(clerkUserId, materialId),
      this.loadContext(clerkUserId),
    ]);
    const saved = await this.prisma.materialSave.findUnique({
      where: { userId_materialId: { userId: context.user.id, materialId } },
      select: { materialId: true },
    });
    return {
      ...material,
      courseCode: material.course?.code ?? null,
      courseTitle: material.course?.title ?? null,
      topicTitle: material.topic?.title ?? null,
      isSaved: Boolean(saved),
    };
  }

  async recordView(clerkUserId: string, materialId: string) {
    const [material, context] = await Promise.all([
      this.getAccessibleMaterial(clerkUserId, materialId),
      this.loadContext(clerkUserId),
    ]);
    await this.prisma.materialView.upsert({
      where: { userId_materialId: { userId: context.user.id, materialId: material.id } },
      update: { lastViewedAt: new Date(), viewCount: { increment: 1 } },
      create: { userId: context.user.id, materialId: material.id },
    });
    return { recorded: true };
  }

  async saveMaterial(clerkUserId: string, materialId: string) {
    const [material, context] = await Promise.all([
      this.getAccessibleMaterial(clerkUserId, materialId),
      this.loadContext(clerkUserId),
    ]);
    await this.prisma.materialSave.upsert({
      where: { userId_materialId: { userId: context.user.id, materialId: material.id } },
      update: {},
      create: { userId: context.user.id, materialId: material.id },
    });
    return { saved: true };
  }

  async unsaveMaterial(clerkUserId: string, materialId: string) {
    const [material, context] = await Promise.all([
      this.getAccessibleMaterial(clerkUserId, materialId),
      this.loadContext(clerkUserId),
    ]);
    await this.prisma.materialSave.deleteMany({ where: { userId: context.user.id, materialId: material.id } });
    return { saved: false };
  }

  async getRecent(clerkUserId: string) {
    const { user, enrollment } = await this.requireEnrollment(clerkUserId);
    return this.getRecentForStudent(user.id, enrollment);
  }

  async getSaved(clerkUserId: string) {
    const { user, enrollment } = await this.requireEnrollment(clerkUserId);
    return this.getSavedForStudent(user.id, enrollment);
  }

  async searchMaterials(clerkUserId: string, query: string, courseId?: string, typeValue?: string) {
    const { user, enrollment, semester } = await this.requireEnrollment(clerkUserId);
    const offerings = await this.prisma.courseOffering.findMany({
      where: this.currentOfferingWhere(enrollment.academicLevelId, semester?.id ?? null),
      select: { courseId: true, course: { select: { isActive: true } } },
    });
    const courseIds = offerings.filter((offering) => offering.course.isActive).map((offering) => offering.courseId);
    if (courseId && !courseIds.includes(courseId)) throw new NotFoundException("Course not found in your current study plan");
    if (!courseIds.length) return [];

    const type = Object.values(MaterialType).find((candidate) => candidate === typeValue);
    const trimmedQuery = query.trim().slice(0, 100);
    const rows = await this.prisma.learningMaterial.findMany({
      where: {
        universityId: enrollment.universityId,
        programId: enrollment.programId,
        status: MaterialStatus.APPROVED,
        ...(type ? { type } : {}),
        OR: [
          { courseId: { in: courseId ? [courseId] : courseIds } },
          { topic: { is: { courseId: { in: courseId ? [courseId] : courseIds }, isActive: true } } },
        ],
        ...(trimmedQuery ? { AND: [{ OR: [
          { title: { contains: trimmedQuery, mode: "insensitive" as const } },
          { description: { contains: trimmedQuery, mode: "insensitive" as const } },
          { course: { is: { code: { contains: trimmedQuery, mode: "insensitive" as const } } } },
          { course: { is: { title: { contains: trimmedQuery, mode: "insensitive" as const } } } },
          { topic: { is: { title: { contains: trimmedQuery, mode: "insensitive" as const } } } },
        ] }] } : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        createdAt: true,
        courseId: true,
        topicId: true,
        course: { select: { code: true, title: true } },
        topic: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const saved = await this.prisma.materialSave.findMany({
      where: { userId: user.id, materialId: { in: rows.map((row) => row.id) } },
      select: { materialId: true },
    });
    const savedIds = new Set(saved.map((entry) => entry.materialId));
    return rows.map((material) => ({
      ...material,
      courseCode: material.course?.code ?? null,
      courseTitle: material.course?.title ?? null,
      topicTitle: material.topic?.title ?? null,
      isSaved: savedIds.has(material.id),
    }));
  }

  async getSubmissions(clerkUserId: string) {
    const { user } = await this.requireEnrollment(clerkUserId);
    return this.getSubmissionsForStudent(user.id);
  }

  async submitMaterial(clerkUserId: string, input: SubmitLearningMaterialInput) {
    const { user, enrollment, semester } = await this.requireEnrollment(clerkUserId);
    const title = typeof input.title === "string" ? input.title.trim() : "";
    const description = typeof input.description === "string" ? input.description.trim() : "";
    const courseId = typeof input.courseId === "string" && input.courseId ? input.courseId : null;
    const topicId = typeof input.topicId === "string" && input.topicId ? input.topicId : null;
    const type = Object.values(MaterialType).find((candidate) => candidate === input.type);

    if (!title || title.length > 180) throw new BadRequestException("Title is required and must be 180 characters or fewer");
    if (description.length > 1500) throw new BadRequestException("Description must be 1,500 characters or fewer");
    if (!type) throw new BadRequestException("Choose a supported material type");
    if (typeof input.url !== "string") throw new BadRequestException("A public resource URL is required");

    let externalUrl: URL;
    try {
      externalUrl = new URL(input.url.trim());
    } catch {
      throw new BadRequestException("Enter a valid resource URL");
    }
    if (!["http:", "https:"].includes(externalUrl.protocol) || externalUrl.username || externalUrl.password) {
      throw new BadRequestException("Resource URLs must use HTTP or HTTPS and cannot contain credentials");
    }
    if (topicId && !courseId) throw new BadRequestException("Choose a course before selecting a topic");

    if (courseId) {
      const offering = await this.prisma.courseOffering.findFirst({
        where: {
          courseId,
          ...this.currentOfferingWhere(enrollment.academicLevelId, semester?.id ?? null),
          course: { isActive: true },
        },
        select: { courseId: true },
      });
      if (!offering) throw new BadRequestException("Choose a course from your current study plan");
    }

    if (topicId) {
      const topic = await this.prisma.topic.findFirst({
        where: { id: topicId, courseId: courseId!, isActive: true },
        select: { id: true },
      });
      if (!topic) throw new BadRequestException("Choose a topic from the selected course");
    }

    return this.prisma.learningMaterial.create({
      data: {
        title,
        description: description || null,
        type,
        status: MaterialStatus.PENDING_REVIEW,
        uploaderId: user.id,
        universityId: enrollment.universityId,
        programId: enrollment.programId,
        courseId,
        topicId,
        externalUrl: externalUrl.href,
      },
      select: { id: true, title: true, type: true, status: true, createdAt: true },
    });
  }

  private async getRecentForStudent(
    userId: string,
    enrollment: {
      universityId: string;
      programId: string;
      academicLevelId: string;
      academicLevel: { semesters: Array<{ id: string }> };
    },
  ) {
    const semesterId = enrollment.academicLevel.semesters.at(-1)?.id ?? null;
    const currentCourseIds = await this.getCurrentCourseIds(enrollment.academicLevelId, semesterId);
    const rows = await this.prisma.materialView.findMany({
      where: {
        userId,
        material: { is: {
          universityId: enrollment.universityId,
          programId: enrollment.programId,
          status: MaterialStatus.APPROVED,
          OR: [
            { courseId: null, topicId: null },
            { courseId: { in: currentCourseIds } },
            { topic: { is: { courseId: { in: currentCourseIds }, isActive: true } } },
          ],
        } },
      },
      include: {
        material: {
          select: {
            id: true,
            title: true,
            type: true,
            description: true,
            createdAt: true,
            courseId: true,
            topicId: true,
            course: { select: { code: true, title: true } },
            topic: { select: { title: true } },
          },
        },
      },
      orderBy: { lastViewedAt: "desc" },
      take: 8,
    });
    const saved = await this.prisma.materialSave.findMany({
      where: { userId, materialId: { in: rows.map((row) => row.materialId) } },
      select: { materialId: true },
    });
    const savedIds = new Set(saved.map((entry) => entry.materialId));
    return rows.map(({ material, lastViewedAt, viewCount }) => ({
      ...material,
      lastViewedAt,
      viewCount,
      courseCode: material.course?.code ?? null,
      courseTitle: material.course?.title ?? null,
      topicTitle: material.topic?.title ?? null,
      isSaved: savedIds.has(material.id),
    }));
  }

  private async getSavedForStudent(
    userId: string,
    enrollment: {
      universityId: string;
      programId: string;
      academicLevelId: string;
      academicLevel: { semesters: Array<{ id: string }> };
    },
  ) {
    const semesterId = enrollment.academicLevel.semesters.at(-1)?.id ?? null;
    const currentCourseIds = await this.getCurrentCourseIds(enrollment.academicLevelId, semesterId);
    const rows = await this.prisma.materialSave.findMany({
      where: {
        userId,
        material: { is: {
          universityId: enrollment.universityId,
          programId: enrollment.programId,
          status: MaterialStatus.APPROVED,
          OR: [
            { courseId: null, topicId: null },
            { courseId: { in: currentCourseIds } },
            { topic: { is: { courseId: { in: currentCourseIds }, isActive: true } } },
          ],
        } },
      },
      include: {
        material: {
          select: {
            id: true,
            title: true,
            type: true,
            description: true,
            createdAt: true,
            courseId: true,
            topicId: true,
            course: { select: { code: true, title: true } },
            topic: { select: { title: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return rows.map(({ material, createdAt }) => ({
      ...material,
      savedAt: createdAt,
      courseCode: material.course?.code ?? null,
      courseTitle: material.course?.title ?? null,
      topicTitle: material.topic?.title ?? null,
      isSaved: true,
    }));
  }

  private async getSubmissionsForStudent(userId: string) {
    return this.prisma.learningMaterial.findMany({
      where: { uploaderId: userId },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        rejectionReason: true,
        createdAt: true,
        course: { select: { code: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  }
}
