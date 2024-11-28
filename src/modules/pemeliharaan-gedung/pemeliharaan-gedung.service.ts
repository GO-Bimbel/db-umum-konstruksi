import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DetailListGedungDto, ImageDetailDto } from 'src/dto/master-gedung-dto';
import {
  CreatePemeliharaanGedungDto,
  PemeliharaanGedungDto,
  UpdatePemeliharaanGedungDto,
} from 'src/dto/pemeliharaan-gedung.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomError } from 'src/utils/CustomError';

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
    await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const bulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const periode = now.getDate() <= 14 ? 1 : 2;

      const gedung_id = dto.data_pemeliharaan[0].gedung_id;
      const bagian_gedung_detail_id =
        dto.data_pemeliharaan[0].bagian_gedung_detail_id;

      const existingCount = await tx.pemeliharaan_gedung.count({
        where: {
          gedung_id,
          bagian_gedung_detail_id,
          bulan,
          periode,
        },
      });

      const bagianDetail = await tx.bagian_gedung_detail.findUnique({
        where: { id: bagian_gedung_detail_id },
        select: { maks_foto: true },
      });

      const totalUploads = existingCount + dto.data_pemeliharaan.length;
      if (totalUploads > bagianDetail.maks_foto) {
        const remaining = bagianDetail.maks_foto - existingCount;
        throw new CustomError(
          `Sudah ada (${existingCount}) dari maksimal (${bagianDetail.maks_foto}) data foto tersimpan untuk bagian gedung detail ID ${bagian_gedung_detail_id}. ` +
            `Kamu hanya boleh upload ${remaining < 0 ? 0 : remaining} foto lagi di periode ini.`,
          400,
        );
      }

      for (const item of dto.data_pemeliharaan) {
        await tx.pemeliharaan_gedung.create({
          data: {
            gedung_id: item.gedung_id,
            bagian_gedung_detail_id: item.bagian_gedung_detail_id,
            kondisi: item.kondisi,
            nama_ruang: item.nama_ruang,
            ruang_id: item.ruang_id,
            catatan: item.catatan,
            image_url: item.image_url,
            updated_by: item.updated_by,
            bulan: bulan,
            periode: periode,
          },
        });
      }

      return { message: 'Records created successfully' };
    });
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

  async getKomponen(params: DetailListGedungDto) {
    const skip = params.page ? (params.page - 1) * params.per_page : 0;

    const where: Prisma.bagian_gedung_detailWhereInput = {
      pemeliharaan_gedung: {
        some: {
          gedung_id: params.gedung_id,
        },
      },
      bagian_gedung_komponen: {
        bagian_gedung: {
          id: params.bagian_gedung_id,
        },
      },
    };

    const [data, total_data] = await Promise.all([
      this.prisma.bagian_gedung_detail.findMany({
        where,
        select: {
          id: true,
          nama: true,
          bagian_gedung_komponen: {
            select: {
              nama: true,
            },
          },
          pemeliharaan_gedung: {
            select: {
              id: true,
              bagian_gedung_detail_id: true,
              gedung_id: true,
              image_url: true,
            },
          },
        },

        skip: params.is_all_data ? undefined : skip,
        take: params.is_all_data ? undefined : params.per_page,
      }),
      this.prisma.bagian_gedung_detail.count({
        where,
      }),
    ]);

    const output = data.map((item) => {
      return {
        id: item.id,
        nama_komponen: item.bagian_gedung_komponen.nama,
        detail_komponen: item.nama,
        pemeliharaan_gedung_id: item.pemeliharaan_gedung
          .filter((pemeliharaan) => pemeliharaan.gedung_id === params.gedung_id)
          .map((pemeliharaan) => pemeliharaan.id),
      };
    });

    return {
      total_data: total_data,
      data: output,
    };
  }
  async getKomponenDetail(params: ImageDetailDto) {
    const skip = params.page ? (params.page - 1) * params.per_page : 0;

    const where: Prisma.pemeliharaan_gedungWhereInput = {
      id: {
        in: params.pemeliharaan_gedung_ids.split(',').map(Number),
      },
    };

    const [data, total_data] = await Promise.all([
      this.prisma.pemeliharaan_gedung.findMany({
        where,
        select: {
          kondisi: true,
          catatan: true,
          image_url: true,
          updated_at: true,
        },
        skip: params.is_all_data ? undefined : skip,
        take: params.is_all_data ? undefined : params.per_page,
      }),
      this.prisma.pemeliharaan_gedung.count({
        where,
      }),
    ]);

    return {
      total_data: total_data,
      data,
    };
  }
}
