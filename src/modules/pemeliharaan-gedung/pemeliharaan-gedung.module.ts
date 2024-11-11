import { Module } from '@nestjs/common';
import { ApiService } from 'src/api/api.service';
import { PemeliharaanGedungController } from './pemeliharaan-gedung.controller';
import { PemeliharaanGedungService } from './pemeliharaan-gedung.service';


@Module({
  controllers: [PemeliharaanGedungController],
  providers: [PemeliharaanGedungService, ApiService],
})
export class PemeliharaanGedungModule {}
