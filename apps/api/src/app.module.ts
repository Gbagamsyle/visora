import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AcademicModule } from "./modules/academic/academic.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AcademicModule, UsersModule],
})
export class AppModule {}
