import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  AttemptStatus,
  EnrollmentStatus,
  FlashcardRating,
  Prisma,
  QuestionScope,
  QuestionType,
  TestStatus,
  TestType,
} from "@prisma/client";
import { PrismaService } from "../../common/prisma.service";

interface QuestionFilters {
  query?: string;
  courseId?: string;
  topicId?: string;
  difficulty?: string;
  examYear?: string;
  type?: string;
}

@Injectable()
export class PracticeService {
  constructor(private readonly prisma: PrismaService) {}

  private async loadContext(clerkUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
      select: {
        id: true,
        enrollment: {
          select: {
            status: true,
            universityId: true,
            programId: true,
            academicLevelId: true,
            university: { select: { name: true } },
            program: { select: { name: true } },
            academicLevel: {
              select: {
                name: true,
                semesters: {
                  where: { isActive: true },
                  orderBy: { sortOrder: "asc" },
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    });
    if (!user) throw new NotFoundException("Your student account has not been set up yet");
    const enrollment = user.enrollment?.status === EnrollmentStatus.ACTIVE ? user.enrollment : null;
    if (!enrollment) return { user, enrollment: null, semester: null, courses: [], courseIds: [], topicIds: [] };

    const semester = enrollment.academicLevel.semesters.at(-1) ?? null;
    const offerings = await this.prisma.courseOffering.findMany({
      where: {
        academicLevelId: enrollment.academicLevelId,
        ...(semester ? { semesterId: semester.id } : {}),
      },
      select: {
        courseId: true,
        course: {
          select: {
            id: true,
            code: true,
            title: true,
            isActive: true,
            topics: { where: { isActive: true }, select: { id: true, courseId: true } },
          },
        },
      },
      orderBy: { course: { title: "asc" } },
    });
    const courses = offerings.filter((offering) => offering.course.isActive).map((offering) => offering.course);
    const courseIds = courses.map((course) => course.id);
    const topicIds = courses.flatMap((course) => course.topics.map((topic) => topic.id));
    return { user, enrollment, semester, courses, courseIds, topicIds };
  }

  private async requireContext(clerkUserId: string) {
    const context = await this.loadContext(clerkUserId);
    if (!context.enrollment) throw new BadRequestException("Complete academic onboarding to access practice");
    return { ...context, enrollment: context.enrollment };
  }

  private questionAccessWhere(context: Awaited<ReturnType<PracticeService["loadContext"]>>): Prisma.QuestionWhereInput {
    if (!context.enrollment) return { id: "__no_enrollment__" };
    return {
      isPublished: true,
      OR: [
        { scope: QuestionScope.GLOBAL, universityId: null, programId: null },
        {
          scope: QuestionScope.UNIVERSITY,
          universityId: context.enrollment.universityId,
          OR: [{ programId: null }, { programId: context.enrollment.programId }],
        },
      ],
      AND: [
        { OR: [{ courseId: null }, { courseId: { in: context.courseIds } }] },
        { OR: [{ topicId: null }, { topicId: { in: context.topicIds } }] },
      ],
    };
  }

  private async getAllowedQuestionIds(context: Awaited<ReturnType<PracticeService["loadContext"]>>) {
    if (!context.enrollment || context.courseIds.length === 0) return new Set<string>();
    const rows = await this.prisma.question.findMany({
      where: this.questionAccessWhere(context),
      select: { id: true, courseId: true, topicId: true, topic: { select: { courseId: true } } },
    });
    return new Set(rows
      .filter((question) => !question.topicId || (
        Boolean(question.topic && context.topicIds.includes(question.topicId))
        && (!question.courseId || question.topic?.courseId === question.courseId)
      ))
      .map((question) => question.id));
  }

  private summarizeTest(test: {
    id: string;
    title: string;
    description: string | null;
    type: TestType;
    durationMin: number | null;
    passMark: number | null;
    questions: Array<{ question: { course: { id: string; code: string; title: string } | null; topic: { courseId: string } | null } }>;
  }) {
    const courseMap = new Map<string, { id: string; code: string; title: string }>();
    for (const item of test.questions) {
      const course = item.question.course;
      if (course) courseMap.set(course.id, course);
    }
    return {
      id: test.id,
      title: test.title,
      description: test.description,
      type: test.type,
      durationMin: test.durationMin,
      questionCount: test.questions.length,
      passMark: test.passMark,
      courseNames: [...courseMap.values()].map((course) => course.code),
    };
  }

  private async getAvailableTests(context: Awaited<ReturnType<PracticeService["loadContext"]>>) {
    if (!context.enrollment) return [];
    const allowedQuestionIds = await this.getAllowedQuestionIds(context);
    if (!allowedQuestionIds.size) return [];
    const tests = await this.prisma.test.findMany({
      where: {
        status: TestStatus.PUBLISHED,
        OR: [{ programId: null }, { programId: context.enrollment.programId }],
      },
      include: {
        questions: {
          orderBy: { sortOrder: "asc" },
          select: {
            questionId: true,
            question: {
              select: {
                id: true,
                course: { select: { id: true, code: true, title: true } },
                topic: { select: { courseId: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return tests
      .filter((test) => test.questions.length > 0 && test.questions.every((item) => allowedQuestionIds.has(item.questionId)))
      .map((test) => this.summarizeTest(test));
  }

  async getOverview(clerkUserId: string) {
    const context = await this.loadContext(clerkUserId);
    if (!context.enrollment) {
      return {
        onboardingComplete: false,
        courses: [],
        metrics: { availableTests: 0, completedAttempts: 0, averageScore: null, sessionsThisWeek: 0 },
        tests: [],
        activeAttempt: null,
        recentAttempts: [],
      };
    }
    const activeAttemptCandidate = await this.prisma.testAttempt.findFirst({
      where: { userId: context.user.id, status: AttemptStatus.IN_PROGRESS },
      select: {
        id: true,
        startedAt: true,
        expiresAt: true,
        test: { select: { id: true, title: true, type: true } },
      },
      orderBy: { startedAt: "desc" },
    });
    if (activeAttemptCandidate?.expiresAt && activeAttemptCandidate.expiresAt <= new Date()) {
      await this.finalizeAttempt(clerkUserId, activeAttemptCandidate.id, true);
    }
    const activeAttempt = activeAttemptCandidate?.expiresAt && activeAttemptCandidate.expiresAt <= new Date()
      ? null
      : activeAttemptCandidate;
    const [tests, recentAttempts, completedAttempts, scoreAggregate, sessionsThisWeek] = await Promise.all([
      this.getAvailableTests(context),
      this.prisma.testAttempt.findMany({
        where: { userId: context.user.id, status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.GRADED, AttemptStatus.EXPIRED] } },
        select: {
          id: true,
          status: true,
          score: true,
          totalMarks: true,
          percentage: true,
          startedAt: true,
          submittedAt: true,
          test: { select: { id: true, title: true, type: true } },
        },
        orderBy: { startedAt: "desc" },
        take: 6,
      }),
      this.prisma.testAttempt.count({
        where: { userId: context.user.id, status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.GRADED, AttemptStatus.EXPIRED] } },
      }),
      this.prisma.testAttempt.aggregate({
        where: { userId: context.user.id, status: AttemptStatus.GRADED, percentage: { not: null } },
        _avg: { percentage: true },
      }),
      this.prisma.testAttempt.count({
        where: { userId: context.user.id, startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
    ]);
    return {
      onboardingComplete: true,
      courses: context.courses.map(({ id, code, title }) => ({ id, code, title })),
      academic: {
        university: context.enrollment.university.name,
        program: context.enrollment.program.name,
        level: context.enrollment.academicLevel.name,
        semester: context.semester?.name ?? null,
      },
      metrics: {
        availableTests: tests.length,
        completedAttempts,
        averageScore: scoreAggregate._avg.percentage,
        sessionsThisWeek,
      },
      activeAttempt,
      tests: tests.slice(0, 6),
      recentAttempts,
    };
  }

  async getTests(clerkUserId: string, typeValue?: string, courseId?: string) {
    const context = await this.requireContext(clerkUserId);
    if (courseId && !context.courseIds.includes(courseId)) throw new NotFoundException("Course not found in your current study plan");
    const tests = await this.getAvailableTests(context);
    return tests.filter((test) => (!typeValue || test.type === typeValue) && (!courseId || test.courseNames.length === 0 || test.courseNames.includes(
      context.courses.find((course) => course.id === courseId)?.code ?? "",
    )));
  }

  private async findAccessibleTest(context: Awaited<ReturnType<PracticeService["loadContext"]>>, testId: string) {
    if (!context.enrollment) throw new BadRequestException("Complete academic onboarding to access practice");
    const allowedQuestionIds = await this.getAllowedQuestionIds(context);
    const test = await this.prisma.test.findFirst({
      where: {
        id: testId,
        status: TestStatus.PUBLISHED,
        OR: [{ programId: null }, { programId: context.enrollment.programId }],
      },
      include: {
        questions: {
          orderBy: { sortOrder: "asc" },
          include: {
            question: {
              include: {
                options: { orderBy: { sortOrder: "asc" }, select: { id: true, text: true, isCorrect: true, sortOrder: true } },
                course: { select: { id: true, code: true, title: true } },
                topic: { select: { id: true, title: true, courseId: true } },
              },
            },
          },
        },
      },
    });
    if (!test || !test.questions.length || !test.questions.every((item) => allowedQuestionIds.has(item.questionId))) {
      throw new NotFoundException("Test not found");
    }
    return test;
  }

  async getTest(clerkUserId: string, testId: string) {
    const context = await this.requireContext(clerkUserId);
    const test = await this.findAccessibleTest(context, testId);
    return {
      ...this.summarizeTest(test),
      questions: test.questions.map(({ question, marks }) => ({
        id: question.id,
        type: question.type,
        body: question.body,
        difficulty: question.difficulty,
        examYear: question.examYear,
        examSession: question.examSession,
        marks,
        course: question.course,
        topic: question.topic ? { id: question.topic.id, title: question.topic.title } : null,
        options: question.options.map(({ id, text }) => ({ id, text })),
      })),
    };
  }

  async getQuestions(clerkUserId: string, filters: QuestionFilters) {
    const context = await this.requireContext(clerkUserId);
    const where: Prisma.QuestionWhereInput = { ...this.questionAccessWhere(context) };
    if (filters.courseId) {
      if (!context.courseIds.includes(filters.courseId)) throw new NotFoundException("Course not found in your current study plan");
      where.courseId = filters.courseId;
    }
    if (filters.topicId) {
      if (!context.topicIds.includes(filters.topicId)) throw new NotFoundException("Topic not found in your current study plan");
      where.topicId = filters.topicId;
    }
    if (filters.difficulty) {
      const difficulty = Number(filters.difficulty);
      if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) throw new BadRequestException("Difficulty must be from 1 to 5");
      where.difficulty = difficulty;
    }
    if (filters.examYear) {
      const examYear = Number(filters.examYear);
      if (!Number.isInteger(examYear) || examYear < 1900 || examYear > new Date().getFullYear() + 1) throw new BadRequestException("Enter a valid exam year");
      where.examYear = examYear;
    }
    if (filters.type) {
      if (!Object.values(QuestionType).includes(filters.type as QuestionType)) throw new BadRequestException("Choose a supported question type");
      where.type = filters.type as QuestionType;
    }
    const query = filters.query?.trim().slice(0, 100);
    if (query) where.body = { contains: query, mode: "insensitive" };
    const questions = await this.prisma.question.findMany({
      where,
      select: {
        id: true,
        type: true,
        body: true,
        difficulty: true,
        examYear: true,
        examSession: true,
        course: { select: { id: true, code: true, title: true } },
        topic: { select: { id: true, title: true, courseId: true } },
        options: { orderBy: { sortOrder: "asc" }, select: { id: true, text: true } },
      },
      orderBy: [{ examYear: "desc" }, { createdAt: "desc" }],
      take: 50,
    });
    return questions.filter((question) => !question.topic || !question.course || question.topic.courseId === question.course.id)
      .map(({ topic, ...question }) => ({ ...question, topic: topic ? { id: topic.id, title: topic.title } : null }));
  }

  async startAttempt(clerkUserId: string, testId: string, body: Record<string, unknown>) {
    const context = await this.requireContext(clerkUserId);
    const test = await this.findAccessibleTest(context, testId);
    const existingAttempt = await this.prisma.testAttempt.findFirst({
      where: { userId: context.user.id, testId, status: AttemptStatus.IN_PROGRESS },
      select: { id: true, expiresAt: true },
      orderBy: { startedAt: "desc" },
    });
    if (existingAttempt && (!existingAttempt.expiresAt || existingAttempt.expiresAt > new Date())) {
      return { attemptId: existingAttempt.id };
    }
    if (existingAttempt) await this.finalizeAttempt(clerkUserId, existingAttempt.id, true);
    const timed = typeof body.timed === "boolean" ? body.timed : test.type !== TestType.PRACTICE && test.durationMin !== null;
    if (timed && (!test.durationMin || test.durationMin < 1)) throw new BadRequestException("This test does not have a time limit configured");

    let questionSet = test.questions.slice();
    if (test.shuffleQuestions) {
      questionSet = questionSet.map((item) => ({ item, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ item }) => item);
    }
    const now = new Date();
    const attempt = await this.prisma.testAttempt.create({
      data: {
        userId: context.user.id,
        testId: test.id,
        expiresAt: timed && test.durationMin ? new Date(now.getTime() + test.durationMin * 60_000) : null,
        answers: {
          create: questionSet.map(({ question, questionId, marks }, position) => ({
            questionId,
            position,
            questionBody: question.body,
            questionType: question.type,
            marksSnapshot: marks,
            explanation: question.explanation,
            correctAnswer: question.correctAnswer,
            markingGuide: question.markingGuide,
            optionsSnapshot: question.options,
          })),
        },
      },
      select: { id: true },
    });
    return { attemptId: attempt.id };
  }

  private async getOwnedAttempt(clerkUserId: string, attemptId: string) {
    const context = await this.requireContext(clerkUserId);
    const attempt = await this.prisma.testAttempt.findFirst({
      where: { id: attemptId, userId: context.user.id },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            type: true,
            durationMin: true,
            questions: { select: { questionId: true, marks: true } },
          },
        },
        answers: {
          orderBy: { position: "asc" },
          include: {
            selectedOptions: { select: { questionOptionId: true } },
            question: {
              select: {
                course: { select: { id: true, code: true, title: true } },
                topic: { select: { id: true, title: true } },
              },
            },
          },
        },
      },
    });
    if (!attempt) throw new NotFoundException("Practice attempt not found");
    return { context, attempt };
  }

  private shapeAttempt(attempt: Awaited<ReturnType<PracticeService["getOwnedAttempt"]>>["attempt"]) {
    return {
      id: attempt.id,
      status: attempt.status,
      startedAt: attempt.startedAt,
      expiresAt: attempt.expiresAt,
      test: attempt.test,
      questions: attempt.answers.map((answer) => {
        const optionsSnapshot = Array.isArray(answer.optionsSnapshot) ? answer.optionsSnapshot as Array<{ id: string; text: string }> : [];
        return {
          id: answer.questionId,
          answerId: answer.id,
          type: answer.questionType ?? QuestionType.SHORT_ANSWER,
          body: answer.questionBody ?? "Question content is no longer available.",
          difficulty: null,
          examYear: null,
          examSession: null,
          course: answer.question.course,
          topic: answer.question.topic,
          options: optionsSnapshot.map(({ id, text }) => ({ id, text })),
          textAnswer: answer.textAnswer,
          selectedOptionIds: answer.selectedOptions.map((option) => option.questionOptionId),
          marks: answer.marksSnapshot ?? attempt.test.questions.find((question) => question.questionId === answer.questionId)?.marks ?? 0,
        };
      }),
    };
  }

  async getAttempt(clerkUserId: string, attemptId: string) {
    let { attempt } = await this.getOwnedAttempt(clerkUserId, attemptId);
    if (attempt.status === AttemptStatus.IN_PROGRESS && attempt.expiresAt && attempt.expiresAt <= new Date()) {
      await this.finalizeAttempt(clerkUserId, attemptId, true);
      return { id: attemptId, status: AttemptStatus.EXPIRED };
    }
    if (attempt.status !== AttemptStatus.IN_PROGRESS) throw new BadRequestException("This attempt has already been submitted");
    return this.shapeAttempt(attempt);
  }

  async saveAnswer(clerkUserId: string, attemptId: string, questionId: string, body: Record<string, unknown>) {
    const { context, attempt } = await this.getOwnedAttempt(clerkUserId, attemptId);
    if (attempt.status !== AttemptStatus.IN_PROGRESS) throw new BadRequestException("This attempt is no longer accepting answers");
    if (attempt.expiresAt && attempt.expiresAt <= new Date()) {
      await this.finalizeAttempt(clerkUserId, attemptId, true);
      throw new BadRequestException("Time expired. Your answers have been submitted");
    }
    const answer = attempt.answers.find((item) => item.questionId === questionId);
    if (!answer) throw new NotFoundException("Question is not part of this attempt");

    const rawOptionIds = body.selectedOptionIds;
    if (rawOptionIds !== undefined && (!Array.isArray(rawOptionIds) || rawOptionIds.some((id) => typeof id !== "string"))) {
      throw new BadRequestException("Selected options must be a list of option IDs");
    }
    const selectedOptionIds = [...new Set((rawOptionIds as string[] | undefined) ?? [])];
    const textAnswer = body.textAnswer;
    if (textAnswer !== undefined && (typeof textAnswer !== "string" || textAnswer.length > 10_000)) {
      throw new BadRequestException("Text answers must be 10,000 characters or fewer");
    }
    if (answer.questionType === QuestionType.SINGLE_CHOICE && selectedOptionIds.length > 1) {
      throw new BadRequestException("Select only one answer for this question");
    }
    if (answer.questionType !== QuestionType.SINGLE_CHOICE && answer.questionType !== QuestionType.MULTIPLE_CHOICE && answer.questionType !== QuestionType.TRUE_FALSE && selectedOptionIds.length > 0) {
      throw new BadRequestException("This question expects a written answer, not selected options");
    }
    if (selectedOptionIds.length) {
      const validOptions = await this.prisma.questionOption.findMany({
        where: { questionId, id: { in: selectedOptionIds } },
        select: { id: true },
      });
      if (validOptions.length !== selectedOptionIds.length) throw new BadRequestException("One or more selected options are invalid for this question");
    }

    await this.prisma.$transaction(async (tx) => {
      const activeAttempt = await tx.testAttempt.updateMany({
        where: { id: attemptId, userId: context.user.id, status: AttemptStatus.IN_PROGRESS },
        data: { updatedAt: new Date() },
      });
      if (activeAttempt.count !== 1) throw new BadRequestException("This attempt is no longer accepting answers");
      await tx.answerOptionSelection.deleteMany({ where: { answerId: answer.id } });
      if (selectedOptionIds.length) {
        await tx.answerOptionSelection.createMany({
          data: selectedOptionIds.map((questionOptionId) => ({ answerId: answer.id, questionOptionId })),
        });
      }
      await tx.attemptAnswer.update({
        where: { id: answer.id },
        data: { textAnswer: typeof textAnswer === "string" ? textAnswer : answer.textAnswer },
      });
    });
    return { saved: true, attemptId, questionId, studentId: context.user.id };
  }

  async submitAttempt(clerkUserId: string, attemptId: string) {
    return this.finalizeAttempt(clerkUserId, attemptId, false);
  }

  private async finalizeAttempt(clerkUserId: string, attemptId: string, expired: boolean) {
    const { context } = await this.getOwnedAttempt(clerkUserId, attemptId);
    return this.prisma.$transaction(async (tx) => {
      const activeAttempt = await tx.testAttempt.updateMany({
        where: { id: attemptId, userId: context.user.id, status: AttemptStatus.IN_PROGRESS },
        data: { updatedAt: new Date() },
      });
      if (activeAttempt.count !== 1) {
        const existing = await tx.testAttempt.findFirst({ where: { id: attemptId, userId: context.user.id }, select: { status: true } });
        if (!existing) throw new NotFoundException("Practice attempt not found");
        return { attemptId, status: existing.status };
      }
      const attempt = await tx.testAttempt.findFirst({
        where: { id: attemptId, userId: context.user.id },
        include: {
          test: { include: { questions: { select: { questionId: true, marks: true } } } },
          answers: {
            orderBy: { position: "asc" },
            include: {
              selectedOptions: { select: { questionOptionId: true } },
              question: { select: { type: true } },
            },
          },
        },
      });
      if (!attempt) throw new NotFoundException("Practice attempt not found");
      if (attempt.status !== AttemptStatus.IN_PROGRESS) return { attemptId, status: attempt.status };
      const deadlineExpired = expired || Boolean(attempt.expiresAt && attempt.expiresAt <= new Date());

      let score = 0;
      let totalMarks = 0;
      let awaitingManualReview = false;
      for (const answer of attempt.answers) {
        const marks = answer.marksSnapshot ?? attempt.test.questions.find((item) => item.questionId === answer.questionId)?.marks ?? 0;
        totalMarks += marks;
        const selected = answer.selectedOptions.map((option) => option.questionOptionId).sort();
        const text = answer.textAnswer?.trim() ?? "";
        let isCorrect: boolean | null = false;
        let needsReview = false;
        const questionType = answer.questionType ?? answer.question.type;
        const optionSnapshot = Array.isArray(answer.optionsSnapshot)
          ? answer.optionsSnapshot as Array<{ id: string; isCorrect: boolean }>
          : [];
        const correctOptionIds = optionSnapshot.filter((option) => option.isCorrect).map((option) => option.id).sort();
        if (questionType === QuestionType.SINGLE_CHOICE || questionType === QuestionType.MULTIPLE_CHOICE || questionType === QuestionType.TRUE_FALSE) {
          isCorrect = correctOptionIds.length > 0 && selected.length === correctOptionIds.length && selected.every((id, index) => id === correctOptionIds[index]);
        } else if (questionType === QuestionType.SHORT_ANSWER) {
          if (text && !answer.correctAnswer) {
            isCorrect = null;
            needsReview = true;
          } else if (text && answer.correctAnswer) {
            isCorrect = text.replace(/\s+/g, " ").toLocaleLowerCase() === answer.correctAnswer.trim().replace(/\s+/g, " ").toLocaleLowerCase();
          }
        } else if (questionType === QuestionType.THEORY && text) {
          isCorrect = null;
          needsReview = true;
        }
        const marksAwarded = needsReview ? null : isCorrect ? marks : 0;
        if (marksAwarded !== null) score += marksAwarded;
        if (needsReview) awaitingManualReview = true;
        await tx.attemptAnswer.update({ where: { id: answer.id }, data: { isCorrect, marksAwarded, needsReview } });
      }
      const status = deadlineExpired ? AttemptStatus.EXPIRED : awaitingManualReview ? AttemptStatus.SUBMITTED : AttemptStatus.GRADED;
      const percentage = awaitingManualReview || totalMarks === 0 ? null : (score / totalMarks) * 100;
      await tx.testAttempt.update({
        where: { id: attemptId },
        data: { status, submittedAt: new Date(), score, totalMarks, percentage },
      });
      return { attemptId, status, score, totalMarks, percentage, awaitingManualReview };
    });
  }

  async getResults(clerkUserId: string, attemptId: string) {
    const { context, attempt } = await this.getOwnedAttempt(clerkUserId, attemptId);
    if (attempt.status === AttemptStatus.IN_PROGRESS) {
      if (attempt.expiresAt && attempt.expiresAt <= new Date()) await this.finalizeAttempt(clerkUserId, attemptId, true);
      else throw new BadRequestException("Submit this attempt before viewing results");
    }
    const result = await this.prisma.testAttempt.findFirst({
      where: { id: attemptId, userId: context.user.id, status: { not: AttemptStatus.IN_PROGRESS } },
      include: {
        test: { select: { id: true, title: true, type: true, durationMin: true, passMark: true, questions: { select: { questionId: true, marks: true } } } },
        answers: {
          orderBy: { position: "asc" },
          include: {
            selectedOptions: { select: { questionOptionId: true } },
            question: { select: { course: { select: { id: true, code: true, title: true } }, topic: { select: { id: true, title: true } } } },
          },
        },
      },
    });
    if (!result) throw new NotFoundException("Practice attempt not found");
    const awaitingManualReview = result.answers.some((answer) => answer.needsReview);
    return {
      id: result.id,
      status: result.status,
      startedAt: result.startedAt,
      submittedAt: result.submittedAt,
      expiresAt: result.expiresAt,
      score: result.score,
      totalMarks: result.totalMarks,
      percentage: result.percentage,
      passed: result.percentage !== null && result.test.passMark !== null ? result.percentage >= result.test.passMark : null,
      awaitingManualReview,
      test: result.test,
      questions: [],
      reviewQuestions: result.answers.map((answer) => {
        const optionsSnapshot = Array.isArray(answer.optionsSnapshot)
          ? answer.optionsSnapshot as Array<{ id: string; text: string; isCorrect: boolean }>
          : [];
        return {
          id: answer.questionId,
          answerId: answer.id,
          type: answer.questionType ?? QuestionType.SHORT_ANSWER,
          body: answer.questionBody ?? "Question content is no longer available.",
          difficulty: null,
          examYear: null,
          examSession: null,
          course: answer.question.course,
          topic: answer.question.topic,
          options: optionsSnapshot.map(({ id, text }) => ({ id, text })),
          textAnswer: answer.textAnswer,
          selectedOptionIds: answer.selectedOptions.map((option) => option.questionOptionId),
          marks: answer.marksSnapshot ?? result.test.questions.find((item) => item.questionId === answer.questionId)?.marks ?? 0,
          correctOptionIds: optionsSnapshot.filter((option) => option.isCorrect).map((option) => option.id),
          correctAnswer: answer.correctAnswer,
          explanation: answer.explanation,
          markingGuide: answer.needsReview ? answer.markingGuide : null,
          isCorrect: answer.isCorrect,
          marksAwarded: answer.marksAwarded,
          needsReview: answer.needsReview,
        };
      }),
    };
  }

  async getHistory(clerkUserId: string) {
    const context = await this.requireContext(clerkUserId);
    return this.prisma.testAttempt.findMany({
      where: { userId: context.user.id, status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.GRADED, AttemptStatus.EXPIRED] } },
      select: {
        id: true,
        status: true,
        startedAt: true,
        submittedAt: true,
        score: true,
        totalMarks: true,
        percentage: true,
        test: { select: { id: true, title: true, type: true } },
        _count: { select: { answers: true } },
      },
      orderBy: { startedAt: "desc" },
      take: 50,
    });
  }

  async getFlashcards(clerkUserId: string, dueOnly: boolean, courseId?: string) {
    const context = await this.requireContext(clerkUserId);
    if (courseId && !context.courseIds.includes(courseId)) throw new NotFoundException("Course not found in your current study plan");
    const now = new Date();
    const cards = await this.prisma.flashcard.findMany({
      where: {
        isPublished: true,
        OR: [
          { universityId: null, programId: null, courseId: null, topicId: null },
          { universityId: context.enrollment.universityId, OR: [{ programId: null }, { programId: context.enrollment.programId }] },
          { programId: context.enrollment.programId },
          { courseId: { in: courseId ? [courseId] : context.courseIds } },
          { topicId: { in: context.topicIds } },
        ],
      },
      include: {
        course: { select: { id: true, code: true, title: true } },
        topic: { select: { id: true, title: true, courseId: true } },
        reviews: { where: { userId: context.user.id }, select: { rating: true, reviewCount: true, nextDueAt: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return cards
      .filter((card) => card.universityId === null || card.universityId === context.enrollment?.universityId)
      .filter((card) => card.programId === null || card.programId === context.enrollment?.programId)
      .filter((card) => card.courseId === null || context.courseIds.includes(card.courseId))
      .filter((card) => !card.topic || context.topicIds.includes(card.topicId ?? ""))
      .filter((card) => !card.topic || !card.courseId || card.topic.courseId === card.courseId)
      .filter((card) => !courseId || card.courseId === courseId || card.topic?.courseId === courseId)
      .map((card) => {
        const review = card.reviews[0];
        return {
          id: card.id,
          front: card.front,
          back: card.back,
          course: card.course,
          topic: card.topic ? { id: card.topic.id, title: card.topic.title } : null,
          nextDueAt: review?.nextDueAt ?? now,
          reviewCount: review?.reviewCount ?? 0,
        };
      })
      .filter((card) => !dueOnly || card.nextDueAt <= now);
  }

  async reviewFlashcard(clerkUserId: string, flashcardId: string, body: Record<string, unknown>) {
    const context = await this.requireContext(clerkUserId);
    if (!Object.values(FlashcardRating).includes(body.rating as FlashcardRating)) {
      throw new BadRequestException("Choose again, hard, good, or easy");
    }
    const cards = await this.getFlashcards(clerkUserId, false);
    if (!cards.some((card) => card.id === flashcardId)) throw new NotFoundException("Flashcard not found");
    const rating = body.rating as FlashcardRating;
    const existing = await this.prisma.flashcardReview.findUnique({
      where: { userId_flashcardId: { userId: context.user.id, flashcardId } },
      select: { reviewCount: true },
    });
    const reviewCount = (existing?.reviewCount ?? 0) + 1;
    const intervalMinutes = rating === FlashcardRating.AGAIN ? 10
      : rating === FlashcardRating.HARD ? 24 * 60
        : rating === FlashcardRating.GOOD ? Math.min(60, 2 ** Math.min(reviewCount, 6)) * 24 * 60
          : Math.min(90, 4 * reviewCount) * 24 * 60;
    const nextDueAt = new Date(Date.now() + intervalMinutes * 60_000);
    await this.prisma.flashcardReview.upsert({
      where: { userId_flashcardId: { userId: context.user.id, flashcardId } },
      update: { rating, reviewCount, lastReviewedAt: new Date(), nextDueAt },
      create: { userId: context.user.id, flashcardId, rating, reviewCount, lastReviewedAt: new Date(), nextDueAt },
    });
    return { flashcardId, rating, reviewCount, nextDueAt };
  }
}
