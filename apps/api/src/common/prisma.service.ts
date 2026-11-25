import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private reconnectTimer?: NodeJS.Timeout;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    const datasourceUrl = databaseUrl ? new URL(databaseUrl) : null;

    // Keep Prisma CLI migrations on the direct URL, but use Neon's pooler for API traffic.
    if (datasourceUrl?.hostname.endsWith(".neon.tech") && !datasourceUrl.hostname.includes("-pooler")) {
      datasourceUrl.hostname = datasourceUrl.hostname.replace(/^(ep-[^.]+)/, "$1-pooler");
    }

    super(datasourceUrl ? { datasources: { db: { url: datasourceUrl.toString() } } } : undefined);
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log("Connected to PostgreSQL");
    } catch {
      this.logger.warn("Initial PostgreSQL connection failed. API is starting in degraded mode; database-backed requests may fail until the database is reachable.");
      this.reconnectTimer = setInterval(() => {
        void this.retryConnection();
      }, 10_000);
      this.reconnectTimer.unref();
    }
  }

  async onModuleDestroy() {
    if (this.reconnectTimer) clearInterval(this.reconnectTimer);
    await this.$disconnect();
  }

  private async retryConnection() {
    try {
      await this.$connect();
      this.logger.log("PostgreSQL connection restored");
      if (this.reconnectTimer) clearInterval(this.reconnectTimer);
      this.reconnectTimer = undefined;
    } catch {
      this.logger.debug("PostgreSQL is still unavailable; will retry");
    }
  }
}
