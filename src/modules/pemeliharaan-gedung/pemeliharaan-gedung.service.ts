import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ApiService } from 'src/api/api.service';
import {
  CreatePemeliharaanGedungDto,
  PemeliharaanGedungDto,
  UpdatePemeliharaanGedungDto,
} from 'src/dto/pemeliharaan-gedung.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PemeliharaanGedungService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly apiService: ApiService,
  ) {}

  async createPemeliharaanGedung(dto: CreatePemeliharaanGedungDto) {
    const createData = dto.data_pemeliharaan.map((item) => ({
      gedung_id: item.gedung_id,
      bagian_gedung_detail_id: item.bagian_gedung_detail,
      kondisi: item.kondisi,
      catatan: item.catatan || null,
      image_url: item.image_url,
      updated_by: item.updater_by,
    }));

    const createdRecords = await this.prisma.pemeliharaan_gedung.createMany({
      data: createData,
    });

    return { createdRecordsCount: createdRecords.count };
  }

  async getPemeliharaanGedung(params: PemeliharaanGedungDto) {
    const skip = params.page ? (params.page - 1) * params.per_page : 0;

    const where: Prisma.pemeliharaan_gedungWhereInput = {
      kondisi: params.kondisi,
    };

    const [data, total_data] = await Promise.all([
      this.prisma.pemeliharaan_gedung.findMany({
        where,
        skip: params.is_all_data ? undefined : skip,
        take: params.is_all_data ? undefined : params.per_page,
      }),
      this.prisma.pemeliharaan_gedung.count({
        where,
      }),
    ]);

    return {
      total_data: total_data,
      data: data,
    };
  }

  async updatePemeliharaanGedung(id: number, dto: UpdatePemeliharaanGedungDto) {
    const result = this.prisma.pemeliharaan_gedung.update({
      where: {
        id: id,
      },
      data: {
        bagian_gedung_detail_id: dto.bagian_gedung_detail,
        kondisi: dto.kondisi,
        catatan: dto.catatan || null,
        image_url: dto.image_url,
        updated_at: new Date(),
        updated_by: dto.updater_by,
      },
    });

    return { updatedRecordsCount: result };
  }
}