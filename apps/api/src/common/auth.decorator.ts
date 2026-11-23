import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface AuthContext {
  clerkUserId: string;
  sessionId?: string;
}

export const Auth = createParamDecorator((_data: unknown, context: ExecutionContext): AuthContext => {
  return context.switchToHttp().getRequest().auth;
});
