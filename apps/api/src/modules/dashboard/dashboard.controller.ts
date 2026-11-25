import { Controller, Get, UseGuards } from "@nestjs/common";
import { Auth, type AuthContext } from "../../common/auth.decorator";
import { ClerkAuthGuard } from "../../common/auth.guard";
import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
@UseGuards(ClerkAuthGuard)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get("me")
  getMyDashboard(@Auth() auth: AuthContext) {
    return this.dashboard.getForUser(auth.clerkUserId);
  }
}
