import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Auth, type AuthContext } from "../../common/auth.decorator";
import { ClerkAuthGuard } from "../../common/auth.guard";
import { UsersService } from "./users.service";

class CompleteOnboardingDto {
  universityId!: string;
  programId!: string;
  academicLevelId!: string;
  displayName?: string;
  phoneNumber?: string;
  matricNumber?: string;
}

@Controller("users")
@UseGuards(ClerkAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post("provision")
  async provision(@Auth() auth: AuthContext) {
    return this.users.provision(auth.clerkUserId);
  }

  @Get("me")
  async me(@Auth() auth: AuthContext) {
    return this.users.getOrProvision(auth.clerkUserId);
  }

  @Post("onboarding")
  async onboarding(@Auth() auth: AuthContext, @Body() body: CompleteOnboardingDto) {
    return this.users.completeOnboarding(auth.clerkUserId, body);
  }
}
