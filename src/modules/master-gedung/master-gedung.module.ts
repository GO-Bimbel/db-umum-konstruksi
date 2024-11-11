import { Module } from '@nestjs/common';
import { MasterGedungService } from './master-gedung.service';
import { MasterGedungController } from './master-gedung,controller';
import { ApiService } from 'src/api/api.service';


@Module({
  controllers: [MasterGedungController],
  providers: [MasterGedungService, ApiService],
})
export class MasterGedungModule {}
