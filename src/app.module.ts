import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerService } from './common/logger/logger.service';
import { ApiModule } from './api/api.module';
import { MasterGedungModule } from './modules/master-gedung/master-gedung.module';
import { PemeliharaanGedungModule } from './modules/pemeliharaan-gedung/pemeliharaan-gedung.module';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TerminusModule.forRoot({
      gracefulShutdownTimeoutMs: 1000,
    }),
    PrismaModule,
    MasterGedungModule,
    PemeliharaanGedungModule,
    ApiModule,
  ],
  controllers: [HealthController],
  providers: [LoggerService],
})
export class AppModule {}
