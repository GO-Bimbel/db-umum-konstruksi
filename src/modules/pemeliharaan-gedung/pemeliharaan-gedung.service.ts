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
    for (const item of dto.data_pemeliharaan) {
      const bagianDetail = await this.prisma.bagian_gedung_detail.findUnique({
        where: { id: item.bagian_gedung_detail_id },
        select: { maks_foto: true },
      });

      const existingCount = await this.prisma.pemeliharaan_gedung.count({
        where: {
          gedung_id: item.gedung_id,
          bagian_gedung_detail_id: item.bagian_gedung_detail_id,
        },
      });

      if (existingCount >= bagianDetail.maks_foto) {
        throw new CustomError(
          `Maximum photo limit (${bagianDetail.maks_foto}) reached for bagian gedung detail ID ${item.bagian_gedung_detail_id}.`,
          400,
        );
      }
    }

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

  async getKomponen(params: DetailListGedungDto) {
    const skip = params.page ? (params.page - 1) * params.per_page : 0;

    const where: Prisma.bagian_gedung_detailWhereInput = {
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
