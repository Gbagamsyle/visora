import { Controller, Get, Param } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";

@Controller("academic")
export class AcademicController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("universities")
  universities() {
    return this.prisma.university.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, shortName: true, slug: true },
    });
  }

  @Get("universities/:universityId/programs")
  programs(@Param("universityId") universityId: string) {
    return this.prisma.program.findMany({
      where: { universityId, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    });
  }

  @Get("programs/:programId/levels")
  levels(@Param("programId") programId: string) {
    return this.prisma.academicLevel.findMany({
      where: { programId, isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, sortOrder: true },
    });
  }
}
