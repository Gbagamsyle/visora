import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { Auth, type AuthContext } from "../../common/auth.decorator";
import { ClerkAuthGuard } from "../../common/auth.guard";
import { PracticeService } from "./practice.service";

@Controller("practice")
@UseGuards(ClerkAuthGuard)
export class PracticeController {
  constructor(private readonly practice: PracticeService) {}

  @Get("me")
  overview(@Auth() auth: AuthContext) {
    return this.practice.getOverview(auth.clerkUserId);
  }

  @Get("tests")
  tests(@Auth() auth: AuthContext, @Query("type") type?: string, @Query("courseId") courseId?: string) {
    return this.practice.getTests(auth.clerkUserId, type, courseId);
  }

  @Get("tests/:testId")
  test(@Auth() auth: AuthContext, @Param("testId") testId: string) {
    return this.practice.getTest(auth.clerkUserId, testId);
  }

  @Post("tests/:testId/attempts")
  startAttempt(@Auth() auth: AuthContext, @Param("testId") testId: string, @Body() body: Record<string, unknown>) {
    return this.practice.startAttempt(auth.clerkUserId, testId, body);
  }

  @Get("questions")
  questions(
    @Auth() auth: AuthContext,
    @Query("q") query?: string,
    @Query("courseId") courseId?: string,
    @Query("topicId") topicId?: string,
    @Query("difficulty") difficulty?: string,
    @Query("examYear") examYear?: string,
    @Query("type") type?: string,
  ) {
    return this.practice.getQuestions(auth.clerkUserId, { query, courseId, topicId, difficulty, examYear, type });
  }

  @Get("attempts/history")
  history(@Auth() auth: AuthContext) {
    return this.practice.getHistory(auth.clerkUserId);
  }

  @Get("attempts/:attemptId")
  attempt(@Auth() auth: AuthContext, @Param("attemptId") attemptId: string) {
    return this.practice.getAttempt(auth.clerkUserId, attemptId);
  }

  @Put("attempts/:attemptId/answers/:questionId")
  answer(
    @Auth() auth: AuthContext,
    @Param("attemptId") attemptId: string,
    @Param("questionId") questionId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.practice.saveAnswer(auth.clerkUserId, attemptId, questionId, body);
  }

  @Post("attempts/:attemptId/submit")
  submit(@Auth() auth: AuthContext, @Param("attemptId") attemptId: string) {
    return this.practice.submitAttempt(auth.clerkUserId, attemptId);
  }

  @Get("attempts/:attemptId/results")
  results(@Auth() auth: AuthContext, @Param("attemptId") attemptId: string) {
    return this.practice.getResults(auth.clerkUserId, attemptId);
  }

  @Get("flashcards")
  flashcards(@Auth() auth: AuthContext, @Query("dueOnly") dueOnly?: string, @Query("courseId") courseId?: string) {
    return this.practice.getFlashcards(auth.clerkUserId, dueOnly === "true", courseId);
  }

  @Put("flashcards/:flashcardId/review")
  reviewFlashcard(
    @Auth() auth: AuthContext,
    @Param("flashcardId") flashcardId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.practice.reviewFlashcard(auth.clerkUserId, flashcardId, body);
  }
}
