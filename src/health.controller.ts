import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { HealthCheck, HealthCheckService } from "@nestjs/terminus";

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly health: HealthCheckService
  ) {}

  @Get()
  @HealthCheck()
  GetHealth() {
    return this.health.check([
      () => this.prisma.isHealthy(),
    ]);
  }
}