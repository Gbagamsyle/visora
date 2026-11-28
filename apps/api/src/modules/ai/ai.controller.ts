import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { Auth, type AuthContext } from "../../common/auth.decorator";
import { ClerkAuthGuard } from "../../common/auth.guard";
import { AiService } from "./ai.service";

@Controller("ai")
@UseGuards(ClerkAuthGuard)
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get("conversations")
  getConversations(@Auth() auth: AuthContext) {
    return this.ai.getConversations(auth.clerkUserId);
  }

  @Post("conversations")
  createConversation(@Auth() auth: AuthContext, @Body() body: Record<string, unknown>) {
    return this.ai.createConversation(auth.clerkUserId, body);
  }

  @Get("conversations/:conversationId")
  getConversation(@Auth() auth: AuthContext, @Param("conversationId") conversationId: string) {
    return this.ai.getConversation(auth.clerkUserId, conversationId);
  }

  @Post("conversations/:conversationId/messages")
  sendMessage(@Auth() auth: AuthContext, @Param("conversationId") conversationId: string, @Body() body: Record<string, unknown>) {
    return this.ai.sendMessage(auth.clerkUserId, conversationId, body);
  }

  @Delete("conversations/:conversationId")
  deleteConversation(@Auth() auth: AuthContext, @Param("conversationId") conversationId: string) {
    return this.ai.deleteConversation(auth.clerkUserId, conversationId);
  }
}
