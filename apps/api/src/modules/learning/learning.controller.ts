import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import type { SubmitLearningMaterialInput } from "@visora/shared";
import { Auth, type AuthContext } from "../../common/auth.decorator";
import { ClerkAuthGuard } from "../../common/auth.guard";
import { LearningService } from "./learning.service";

@Controller("learning")
@UseGuards(ClerkAuthGuard)
export class LearningController {
  constructor(private readonly learning: LearningService) {}

  @Get("me")
  getOverview(@Auth() auth: AuthContext) {
    return this.learning.getOverview(auth.clerkUserId);
  }

  @Get("recent")
  getRecent(@Auth() auth: AuthContext) {
    return this.learning.getRecent(auth.clerkUserId);
  }

  @Get("saved")
  getSaved(@Auth() auth: AuthContext) {
    return this.learning.getSaved(auth.clerkUserId);
  }

  @Get("materials")
  searchMaterials(
    @Auth() auth: AuthContext,
    @Query("q") query = "",
    @Query("courseId") courseId?: string,
    @Query("type") type?: string,
  ) {
    return this.learning.searchMaterials(auth.clerkUserId, query, courseId, type);
  }

  @Get("submissions")
  getSubmissions(@Auth() auth: AuthContext) {
    return this.learning.getSubmissions(auth.clerkUserId);
  }

  @Get("courses/:courseId")
  getCourse(@Auth() auth: AuthContext, @Param("courseId") courseId: string) {
    return this.learning.getCourse(auth.clerkUserId, courseId);
  }

  @Get("materials/:materialId")
  getMaterial(@Auth() auth: AuthContext, @Param("materialId") materialId: string) {
    return this.learning.getMaterial(auth.clerkUserId, materialId);
  }

  @Post("materials/:materialId/view")
  recordView(@Auth() auth: AuthContext, @Param("materialId") materialId: string) {
    return this.learning.recordView(auth.clerkUserId, materialId);
  }

  @Put("materials/:materialId/save")
  saveMaterial(@Auth() auth: AuthContext, @Param("materialId") materialId: string) {
    return this.learning.saveMaterial(auth.clerkUserId, materialId);
  }

  @Delete("materials/:materialId/save")
  unsaveMaterial(@Auth() auth: AuthContext, @Param("materialId") materialId: string) {
    return this.learning.unsaveMaterial(auth.clerkUserId, materialId);
  }

  @Post("materials")
  submitMaterial(@Auth() auth: AuthContext, @Body() input: SubmitLearningMaterialInput) {
    return this.learning.submitMaterial(auth.clerkUserId, input);
  }
}
