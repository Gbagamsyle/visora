export type ApiStatus = {
  status: "ok";
};

export type LearningMaterialType = "PDF" | "DOCUMENT" | "PRESENTATION" | "IMAGE" | "VIDEO" | "LINK" | "OTHER";
export type LearningMaterialStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "ARCHIVED";

export interface LearningMaterialSummary {
  id: string;
  title: string;
  description: string | null;
  type: LearningMaterialType;
  createdAt: string;
  courseId: string | null;
  topicId: string | null;
  courseCode: string | null;
  courseTitle: string | null;
  topicTitle: string | null;
  isSaved: boolean;
}

export interface LearningCourseSummary {
  id: string;
  code: string;
  title: string;
  description: string | null;
  creditUnits: number | null;
  semester: string;
  topicCount: number;
  materialCount: number;
  savedMaterialCount: number;
  recentlyViewed: boolean;
}

export interface LearningSubmissionSummary {
  id: string;
  title: string;
  type: LearningMaterialType;
  status: LearningMaterialStatus;
  rejectionReason: string | null;
  createdAt: string;
  course: { code: string; title: string } | null;
}

export interface LearningOverview {
  onboardingComplete: boolean;
  student: { displayName: string };
  academic: {
    university: string;
    universityShortName: string | null;
    program: string;
    level: string;
    semester: string | null;
  } | null;
  metrics: { courses: number; newMaterials: number };
  courses: LearningCourseSummary[];
  recentMaterials: LearningMaterialSummary[];
  savedMaterials: LearningMaterialSummary[];
  submissions: LearningSubmissionSummary[];
}

export interface LearningCourseDetail {
  course: {
    id: string;
    code: string;
    title: string;
    description: string | null;
    creditUnits: number | null;
    semester: string;
  };
  topics: Array<{
    id: string;
    title: string;
    description: string | null;
    sortOrder: number;
    materials: Array<LearningMaterialSummary & { course: { code: string; title: string } | null; topic: { id: string; title: string } | null }>;
  }>;
  uncategorizedMaterials: Array<LearningMaterialSummary & { course: { code: string; title: string } | null; topic: { id: string; title: string } | null }>;
}

export interface LearningMaterialDetail extends LearningMaterialSummary {
  externalUrl: string | null;
  course: { code: string; title: string } | null;
  topic: { id: string; title: string; courseId: string } | null;
}

export interface SubmitLearningMaterialInput {
  title: string;
  description?: string;
  type: LearningMaterialType;
  url: string;
  courseId?: string;
  topicId?: string;
}

export type PracticeQuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "THEORY";
export type PracticeTestType = "PRACTICE" | "TIMED_TEST" | "MOCK_EXAM";
export type PracticeAttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "GRADED" | "EXPIRED";

export interface PracticeTestSummary {
  id: string;
  title: string;
  description: string | null;
  type: PracticeTestType;
  durationMin: number | null;
  questionCount: number;
  passMark: number | null;
  courseNames: string[];
}

export interface PracticeQuestionSummary {
  id: string;
  type: PracticeQuestionType;
  body: string;
  difficulty: number | null;
  examYear: number | null;
  examSession: string | null;
  course: { id: string; code: string; title: string } | null;
  topic: { id: string; title: string } | null;
  options: Array<{ id: string; text: string }>;
}

export interface PracticeOverview {
  onboardingComplete: boolean;
  courses: Array<{ id: string; code: string; title: string }>;
  academic?: { university: string; program: string; level: string; semester: string | null };
  metrics: { availableTests: number; completedAttempts: number; averageScore: number | null; sessionsThisWeek: number };
  tests: PracticeTestSummary[];
  activeAttempt: { id: string; startedAt: string; expiresAt: string | null; test: { id: string; title: string; type: PracticeTestType } } | null;
  recentAttempts: Array<{
    id: string;
    status: PracticeAttemptStatus;
    score: number | null;
    totalMarks: number | null;
    percentage: number | null;
    startedAt: string;
    submittedAt: string | null;
    test: { id: string; title: string; type: PracticeTestType };
  }>;
}

export interface PracticeAttemptQuestion extends PracticeQuestionSummary {
  answerId: string;
  textAnswer: string | null;
  selectedOptionIds: string[];
  marks: number;
}

export interface PracticeAttempt {
  id: string;
  status: PracticeAttemptStatus;
  startedAt: string;
  expiresAt: string | null;
  test: { id: string; title: string; type: PracticeTestType; durationMin: number | null };
  questions: PracticeAttemptQuestion[];
}

export interface PracticeAttemptResult extends PracticeAttempt {
  submittedAt: string | null;
  score: number | null;
  totalMarks: number | null;
  percentage: number | null;
  passed: boolean | null;
  awaitingManualReview: boolean;
  reviewQuestions: Array<PracticeAttemptQuestion & {
    correctOptionIds: string[];
    correctAnswer: string | null;
    explanation: string | null;
    markingGuide: string | null;
    isCorrect: boolean | null;
    marksAwarded: number | null;
    needsReview: boolean;
  }>;
}

export interface FlashcardSummary {
  id: string;
  front: string;
  back: string;
  course: { id: string; code: string; title: string } | null;
  topic: { id: string; title: string } | null;
  nextDueAt: string;
  reviewCount: number;
}

export interface AiCitation {
  id: string;
  title: string;
  course: string | null;
  type: string;
  externalUrl: string | null;
}

export interface AiMessage {
  id: string;
  role: "USER" | "ASSISTANT" | string;
  content: string;
  citations: AiCitation[];
  status: "COMPLETED" | "LIMITED" | "ERROR" | string;
  errorMessage: string | null;
  createdAt: string;
}

export interface AiConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  messages: AiMessage[];
}

export interface AiConversationDetail extends AiConversationSummary {
  messages: AiMessage[];
}
