import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerService } from './common/logger/logger.service';
import { ApiModule } from './api/api.module';
import { MasterGedungModule } from './modules/master-gedung/master-gedung.module';
import { PemeliharaanGedungModule } from './modules/pemeliharaan-gedung/pemeliharaan-gedung.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    MasterGedungModule,
    PemeliharaanGedungModule,
    ApiModule,
  ],
  providers: [LoggerService],
})
export class AppModule {}
