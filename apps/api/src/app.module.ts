import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AcademicModule } from "./modules/academic/academic.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { LearningModule } from "./modules/learning/learning.module";
import { PracticeModule } from "./modules/practice/practice.module";
import { AiModule } from "./modules/ai/ai.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AcademicModule, AiModule, DashboardModule, LearningModule, PracticeModule, UsersModule],
})
export class AppModule {}
