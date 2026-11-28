import { Module } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { LearningController } from "./learning.controller";
import { LearningService } from "./learning.service";

@Module({
  controllers: [LearningController],
  providers: [LearningService, PrismaService],
})
export class LearningModule {}
