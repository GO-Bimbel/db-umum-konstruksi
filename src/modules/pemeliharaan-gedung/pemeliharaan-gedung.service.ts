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

export interface PemeliharaanGedung {
  id: number;
  nama_komponen: string;
  detail_komponen: string;
  pemeliharaan_gedung_id: number[];
}

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
    const now = new Date();
    const bulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const periode = now.getDate() <= 14 ? 1 : 2;

    const gedung_id = dto.data_pemeliharaan[0].gedung_id;
    const bagian_gedung_detail_id =
      dto.data_pemeliharaan[0].bagian_gedung_detail_id;

    const existingCount = await this.prisma.pemeliharaan_gedung_foto.count({
      where: {
        pemeliharaan_gedung: {
          gedung_id,
          bagian_gedung_detail_id,
          bulan,
          periode,
        },
      },
    });

    const bagianDetail = await this.prisma.bagian_gedung_detail.findUnique({
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

    const createData = dto.data_pemeliharaan.map((item) => ({
      gedung_id: gedung_id,
      bagian_gedung_detail_id: bagian_gedung_detail_id,
      kondisi: item.kondisi,
      nama_ruang: item.nama_ruang || null,
      ruang_id: item.ruang_id || null,
      catatan: item.catatan || null,
      bulan: bulan,
      periode: periode,
      updated_by: item.updated_by,
    }));

    const result = await this.prisma.$transaction(async (tx) => {
      const pemeliharaanGedung = await tx.pemeliharaan_gedung.upsert({
        where: {
          gedung_id_bagian_bulan_periode: {
            gedung_id,
            bagian_gedung_detail_id,
            bulan,
            periode,
          },
        },
        create: createData[0],
        update: {},
      });

      const createFotoData = {
        pemeliharaan_gedung_id: pemeliharaanGedung.id,
        image_url: dto.data_pemeliharaan[0].image_url,
        updated_by: dto.data_pemeliharaan[0].updated_by,
      };

      await tx.pemeliharaan_gedung_foto.create({
        data: createFotoData,
      });

      return { message: 'Records created successfully' };
    });

    return result;
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
        // image_url: dto.image_url,
        pemeliharaan_gedung_foto: {},
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
          bulan: params.bulan,
          periode: params.periode,
        },
      },
      bagian_gedung_komponen: {
        bagian_gedung: {
          id: params.bagian_gedung_id,
        },
      },
    };

    const [data, total_data] = await Promise.all([
      this.prisma.$queryRaw<PemeliharaanGedung[]>`
          SELECT 
              bgd.id id,
              bgk.nama AS nama_komponen,
              bgd.nama AS detail_komponen,
              COALESCE(jsonb_agg(pg.id) FILTER (WHERE pg.id IS NOT NULL), '[]'::jsonb) AS pemeliharaan_gedung_id
          FROM bagian_gedung_detail bgd
          JOIN bagian_gedung_komponen bgk ON bgk.id = bgd.bagian_gedung_komponen_id 
          LEFT JOIN pemeliharaan_gedung pg ON pg.bagian_gedung_detail_id = bgd.id AND (pg.gedung_id = ${params.gedung_id} OR pg.gedung_id IS NULL)
          WHERE bgk.bagian_gedung_id = ${params.bagian_gedung_id}
          GROUP BY bgk.id, bgd.id, bgk.nama, bgd.nama
          ORDER BY 
              (COALESCE(jsonb_agg(pg.id) FILTER (WHERE pg.id IS NOT NULL), '[]'::jsonb) = '[]'::jsonb) ASC,
              bgk.id, bgd.id
          ${params.is_all_data ? Prisma.empty : Prisma.sql`LIMIT ${params.per_page} OFFSET ${skip}`};
      `,
      this.prisma.$queryRaw<{ count: number }[]>`
          SELECT 
              COUNT(*)::int
          FROM bagian_gedung_detail bgd
          JOIN bagian_gedung_komponen bgk ON bgk.id = bgd.bagian_gedung_komponen_id 
          WHERE bgk.bagian_gedung_id = ${params.bagian_gedung_id}
          GROUP BY bgk.id, bgd.id, bgk.nama, bgd.nama
      `,
    ]);

    return {
      total_data: total_data[0].count,
      data: data,
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
          pemeliharaan_gedung_foto: {
            select: {
              image_url: true,
            },
          },
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
