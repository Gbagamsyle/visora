import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AcademicModule } from "./modules/academic/academic.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AcademicModule, DashboardModule, UsersModule],
})
export class AppModule {}
