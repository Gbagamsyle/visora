import { createClerkClient } from "@clerk/backend";
import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";

interface OnboardingInput {
  universityId: string;
  programId: string;
  academicLevelId: string;
  displayName?: string;
  phoneNumber?: string;
  matricNumber?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async provision(clerkUserId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { clerkUserId },
      include: { enrollment: true, roles: { include: { role: true } }, profile: true },
    });
    if (existing) return existing;

    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const clerkUser = await clerk.users.getUser(clerkUserId);
    const email = clerkUser.emailAddresses.find((item) => item.id === clerkUser.primaryEmailAddressId)?.emailAddress
      ?? clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) throw new BadRequestException("The Clerk account has no email address");

    const studentRole = await this.prisma.role.findUnique({ where: { name: "STUDENT" } });

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          clerkUserId,
          email,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          avatarUrl: clerkUser.imageUrl,
        },
      });

      if (studentRole) {
        await tx.userRole.create({ data: { userId: user.id, roleId: studentRole.id } });
      }

      return tx.user.findUnique({
        where: { id: user.id },
        include: { enrollment: true, roles: { include: { role: true } }, profile: true },
      });
    });
  }

  async getOrProvision(clerkUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
      include: { enrollment: true, roles: { include: { role: true } }, profile: true },
    });

    if (!user) throw new BadRequestException("Local user provisioning is required");
    return user;
  }

  async completeOnboarding(clerkUserId: string, input: OnboardingInput) {
    if (!input.universityId || !input.programId || !input.academicLevelId) {
      throw new BadRequestException("University, program, and academic level are required");
    }

    const [university, program, level] = await Promise.all([
      this.prisma.university.findUnique({ where: { id: input.universityId } }),
      this.prisma.program.findUnique({ where: { id: input.programId } }),
      this.prisma.academicLevel.findUnique({ where: { id: input.academicLevelId } }),
    ]);

    if (!university?.isActive) throw new BadRequestException("University is unavailable");
    if (!program?.isActive || program.universityId !== university.id) throw new BadRequestException("Programme is unavailable");
    if (!level?.isActive || level.programId !== program.id) throw new BadRequestException("Academic level is unavailable");

    const user = await this.prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) throw new BadRequestException("Local user must be provisioned before onboarding");

    const studentRole = await this.prisma.role.findUnique({ where: { name: "STUDENT" } });

    await this.prisma.$transaction(async (tx) => {
      await tx.studentProfile.upsert({
        where: { userId: user.id },
        update: { displayName: input.displayName, phoneNumber: input.phoneNumber },
        create: { userId: user.id, displayName: input.displayName, phoneNumber: input.phoneNumber },
      });

      await tx.studentEnrollment.upsert({
        where: { userId: user.id },
        update: { universityId: university.id, programId: program.id, academicLevelId: level.id, status: "ACTIVE", matricNumber: input.matricNumber },
        create: { userId: user.id, universityId: university.id, programId: program.id, academicLevelId: level.id, status: "ACTIVE", matricNumber: input.matricNumber },
      });

      if (studentRole) {
        await tx.userRole.upsert({
          where: { userId_roleId: { userId: user.id, roleId: studentRole.id } },
          update: {},
          create: { userId: user.id, roleId: studentRole.id },
        });
      }
    });

    return this.prisma.user.findUnique({
      where: { clerkUserId },
      include: { enrollment: true, roles: { include: { role: true } }, profile: true },
    });
  }
}
