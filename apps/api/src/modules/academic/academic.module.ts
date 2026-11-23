import { Module } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { AcademicController } from "./academic.controller";

@Module({
  controllers: [AcademicController],
  providers: [PrismaService],
})
export class AcademicModule {}
