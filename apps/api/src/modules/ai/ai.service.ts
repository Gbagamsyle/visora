import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { EnrollmentStatus, MaterialStatus } from "@prisma/client";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  private async getUser(clerkUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        profile: true,
        enrollment: {
          include: {
            university: true,
            program: true,
            academicLevel: { include: { semesters: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } } },
          },
        },
      },
    });
    if (!user) throw new NotFoundException("Your student account has not been set up yet");
    return user;
  }

  private async getContext(userId: string, enrollment: Awaited<ReturnType<AiService["getUser"]>>["enrollment"]) {
    if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) return { academic: null, citations: [] as Array<{ id: string; title: string; course: string | null; type: string; externalUrl: string | null }> };
    const semester = enrollment.academicLevel.semesters.at(-1);
    const offerings = await this.prisma.courseOffering.findMany({
      where: { academicLevelId: enrollment.academicLevelId, ...(semester ? { semesterId: semester.id } : {}) },
      include: { course: { select: { id: true, code: true, title: true } } },
    });
    const courseIds = offerings.map((item) => item.courseId);
    const materials = await this.prisma.learningMaterial.findMany({
      where: { status: MaterialStatus.APPROVED, universityId: enrollment.universityId, programId: enrollment.programId, OR: [{ courseId: { in: courseIds } }, { topic: { is: { courseId: { in: courseIds }, isActive: true } } }] },
      take: 12,
      orderBy: { updatedAt: "desc" },
      include: { course: { select: { code: true, title: true } }, topic: { select: { title: true } } },
    });
    return {
      academic: { university: enrollment.university.name, program: enrollment.program.name, level: enrollment.academicLevel.name, semester: semester?.name ?? null, courses: offerings.map((item) => `${item.course.code} — ${item.course.title}`) },
      citations: materials.map((material) => ({ id: material.id, title: material.title, course: material.course ? `${material.course.code} — ${material.course.title}` : null, type: material.type, externalUrl: material.externalUrl })),
    };
  }

  async getConversations(clerkUserId: string) {
    const user = await this.getUser(clerkUserId);
    return this.prisma.aiConversation.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, take: 30, include: { messages: { orderBy: { createdAt: "asc" }, take: 1 } } });
  }

  async createConversation(clerkUserId: string, body: Record<string, unknown>) {
    const user = await this.getUser(clerkUserId);
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "New study conversation";
    return this.prisma.aiConversation.create({ data: { userId: user.id, title: title || "New study conversation" }, include: { messages: true } });
  }

  async getConversation(clerkUserId: string, conversationId: string) {
    const user = await this.getUser(clerkUserId);
    const conversation = await this.prisma.aiConversation.findFirst({ where: { id: conversationId, userId: user.id }, include: { messages: { orderBy: { createdAt: "asc" } } } });
    if (!conversation) throw new NotFoundException("Conversation not found");
    return conversation;
  }

  async deleteConversation(clerkUserId: string, conversationId: string) {
    const user = await this.getUser(clerkUserId);
    const deleted = await this.prisma.aiConversation.deleteMany({ where: { id: conversationId, userId: user.id } });
    if (!deleted.count) throw new NotFoundException("Conversation not found");
    return { deleted: true };
  }

  async sendMessage(clerkUserId: string, conversationId: string, body: Record<string, unknown>) {
    const user = await this.getUser(clerkUserId);
    const conversation = await this.prisma.aiConversation.findFirst({ where: { id: conversationId, userId: user.id }, include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } } });
    if (!conversation) throw new NotFoundException("Conversation not found");

    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content) throw new BadRequestException("Enter a message");
    if (content.length > 4000) throw new BadRequestException("Messages may not exceed 4000 characters");

    const userMessage = await this.prisma.aiMessage.create({ data: { conversationId, role: "USER", content } });
    const context = await this.getContext(user.id, user.enrollment);
    const citationJson = context.citations.slice(0, 6);

    let answer: string;
    let status = "COMPLETED";
    let errorMessage: string | null = null;
    const apiKey = process.env.AI_API_KEY;
    const apiUrl = process.env.AI_API_URL;

    if (!apiKey || !apiUrl) {
      status = "LIMITED";
      answer = context.academic
        ? `I can help frame this study question, but a live AI provider is not configured.\n\nYour context: ${context.academic.courses.join("; ") || "your current courses"}.\n\nA useful next step is to review the approved course materials below, then explain the concept in your own words and identify which part you want to clarify.`
        : "I can begin the conversation, but a live AI provider is not configured and academic onboarding is incomplete. Complete onboarding before requesting course-specific support.";
    } else {
      try {
        const system = `You are Visora AI, an optometry study companion. Be accurate, detailed where the question requires detail, and student-safe.

Formatting requirements:
- Organize answers with clear Markdown headings (##) and short sections.
- Use **bold** for important terms, definitions, formulas, thresholds, and key conclusions.
- Use bullets for lists and numbered lists for sequences or steps.
- Prefer tables when comparing concepts, only when useful.
- Define unfamiliar abbreviations on first use.
- Keep paragraphs concise and avoid unnecessarily simplified explanations.
- Use plain Markdown only; do not return HTML.

Use the student's academic context and approved learning materials only as supporting context. Never claim a material was read if it was not provided. State uncertainty and verify clinical details with course staff or approved sources.
Academic context: ${JSON.stringify(context.academic)}
Approved material titles: ${JSON.stringify(citationJson)}`;
        const messages = [...conversation.messages, userMessage].map((message) => ({ role: message.role === "USER" ? "user" : "assistant", content: message.content })).slice(-20);
        const response = await fetch(`${apiUrl.replace(/\/$/, "")}/chat/completions`, {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model: process.env.AI_MODEL ?? "gpt-4o-mini", messages: [{ role: "system", content: system }, ...messages], temperature: 0.2 }),
        });
        if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
        const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
        answer = payload.choices?.[0]?.message?.content?.trim() || "I could not generate a response. Please try again.";
      } catch (error) {
        status = "ERROR";
        errorMessage = error instanceof Error ? error.message : "AI provider unavailable";
        answer = "Visora AI is temporarily unavailable. Please try again shortly. For important academic or clinical details, verify against approved course materials.";
      }
    }

    const assistantMessage = await this.prisma.aiMessage.create({ data: { conversationId, role: "ASSISTANT", content: answer, citations: citationJson as object, status, errorMessage } });
    await this.prisma.aiConversation.update({ where: { id: conversationId }, data: { title: conversation.title === "New study conversation" ? content.slice(0, 120) : conversation.title } });
    return assistantMessage;
  }
}
