import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CreatePemeliharaanGedungDto,
  PemeliharaanGedungDto,
  UpdatePemeliharaanGedungDto,
} from 'src/dto/pemeliharaan-gedung.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PemeliharaanGedungService {
  constructor(private readonly prisma: PrismaService) {}

  async getPemeliharaanGedung(params: PemeliharaanGedungDto) {
    const skip = params.page ? (params.page - 1) * params.per_page : 0;

    const where: Prisma.pemeliharaan_gedungWhereInput = {
      kondisi: params.kondisi,
      gedung_id: params.gedung_id,
      bagian_gedung_detail_id: params.bagian_gedung_detail_id,
      ruang_id: params.ruang_id,
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

  async createPemeliharaanGedung(dto: CreatePemeliharaanGedungDto) {
    const createData = dto.data_pemeliharaan.map((item) => ({
      gedung_id: item.gedung_id,
      bagian_gedung_detail_id: item.bagian_gedung_detail_id,
      kondisi: item.kondisi,
      nama_ruang: item.nama_ruang,
      ruang_id: item.ruang_id,
      catatan: item.catatan || null,
      image_url: item.image_url,
      updated_by: item.updated_by,
    }));

    const createdRecords = await this.prisma.pemeliharaan_gedung.createMany({
      data: createData,
    });

    return { createdRecordsCount: createdRecords.count };
  }

  async updatePemeliharaanGedung(id: number, dto: UpdatePemeliharaanGedungDto) {
    const result = await this.prisma.pemeliharaan_gedung.update({
      where: {
        id: id,
      },
      data: {
        bagian_gedung_detail_id: dto.bagian_gedung_detail_id,
        kondisi: dto.kondisi,
        catatan: dto.catatan || null,
        image_url: dto.image_url,
        updated_at: new Date(),
        updated_by: dto.updated_by,
      },
    });

    return { updatedRecordsCount: result };
  }
}
