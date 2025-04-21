import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DetailListGedungDto, ImageDetailDto } from 'src/dto/master-gedung-dto';
import {
  OpsiCakupanDto,
  CreatePemeliharaanGedungDto,
  PemeliharaanGedungDetailDto,
  PemeliharaanGedungDto,
  UpdatePemeliharaanGedungDto,
} from 'src/dto/pemeliharaan-gedung.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomError } from 'src/utils/CustomError';
import { ApiService } from 'src/api/api.service';
import { identity } from 'rxjs';

export interface PemeliharaanGedung {
  id: number;
  nama_komponen: string;
  detail_komponen: string;
  pemeliharaan_gedung_id: number[];
}

@Injectable()
export class PemeliharaanGedungService {
  constructor(
    private readonly httpService: ApiService,
    private readonly prisma: PrismaService,
  ) {}

  async getOpsiKota(params: OpsiCakupanDto) {
    const respGoKaryawan = await this.httpService.get(
      `${process.env.SVC_DB_GO}/api/v1/karyawan/detail/${params.nik}`,
    );
    const dataKaryawan = respGoKaryawan?.data ?? [];
    const kotaIds = dataKaryawan.kota_ids.split(',').map(Number);

    const respGoKota = await this.httpService.get(
      `${process.env.SVC_DB_GO}/api/v1/kota-gedung-ids?cabang_id=${params.id}`,
    );
    const dataKota = respGoKota?.data ?? [];
    const dataKotaFilter = dataKota.filter((kota)=>kotaIds.includes(kota.c_id_kota));

    const now = new Date();
    const bulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const periode = now.getDate() <= 14 ? 1 : 2;

    const dataPemeliharaanGedung =
      await this.prisma.pemeliharaan_gedung.findMany({
        where: {
          gedung_id: {
            in: dataKotaFilter.flatMap((item) => item.gedung_ids) ?? [],
          },
          periode: periode,
          bulan: bulan
        },
      });

    const pemeliharaanGedungSet = new Set(
      dataPemeliharaanGedung.map((g) => g.gedung_id),
    );

    return dataKotaFilter.map((item) => {
      const matchDataGedung = item.gedung_ids.some((id) =>
        pemeliharaanGedungSet.has(id),
      );

      return {
        id: item.c_id_kota,
        nama: item.c_kota,
        is_input: matchDataGedung,
      };
    });
  }

  async getOpsiSekre(params: OpsiCakupanDto) {
    const respGoKaryawan = await this.httpService.get(
      `${process.env.SVC_DB_GO}/api/v1/karyawan/detail/${params.nik}`,
    );
    const dataKaryawan = respGoKaryawan?.data ?? [];
    const sekreIds = dataKaryawan.sekre_ids.split(',').map(Number);

    const respGoSekre = await this.httpService.get(
      `${process.env.SVC_DB_GO}/api/v1/sekretariat/gedung-list-per-sekre?kota_id=${params.id}`,
    );
    const dataSekre = respGoSekre?.data ?? [];
    const dataSekreFilter = dataSekre.filter((sekre)=>sekreIds.includes(sekre.id));

    const now = new Date();
    const bulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const periode = now.getDate() <= 14 ? 1 : 2;

    const dataPemeliharaanGedung =
      await this.prisma.pemeliharaan_gedung.findMany({
        where: {
          gedung_id: {
            in: dataSekreFilter.flatMap((item) => item.gedung_ids) ?? [],
          },
          periode: periode,
          bulan: bulan
        },
      });

    const pemeliharaanGedungSet = new Set(
      dataPemeliharaanGedung.map((g) => g.gedung_id),
    );

    return dataSekreFilter.map((item) => {
      const matchDataGedung = item.gedung_ids.some((id) =>
        pemeliharaanGedungSet.has(id),
      );

      return {
        id: item.id,
        nama: item.nama ?? null,
        is_input: matchDataGedung,
      };
    });
  }

  async getOpsiGedung(params: OpsiCakupanDto) {
    let gedungIds = [];
    if (params.ids) {
      gedungIds = params.ids.split(',').map(Number);
    } else {
      const respGoKaryawan = await this.httpService.get(
        `${process.env.SVC_DB_GO}/api/v1/karyawan/detail/${params.nik}`,
      );
      const dataKaryawan = respGoKaryawan?.data ?? [];
      gedungIds = dataKaryawan.gedung_ids.split(',').map(Number);
    }

    const respGoGedung = await this.httpService.get(
      `${process.env.SVC_DB_GO}/api/v1/gedung/gedung-by-sekretariat?sekretariat_ids=${params.id}`,
    );
    const dataGedung = respGoGedung?.data ?? [];
    const dataGedungFilter = dataGedung.filter((gedung)=>gedungIds.includes(gedung.c_id_gedung));

    const now = new Date();
    const bulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const periode = now.getDate() <= 14 ? 1 : 2;
    
    const dataPemeliharaanGedung =
      await this.prisma.pemeliharaan_gedung.findMany({
        where: {
          gedung_id: {
            in: dataGedungFilter.map((item) => item.c_id_gedung) ?? [],
          },
          periode: periode,
          bulan: bulan
        },
      });


    const pemeliharaanGedungIds = dataPemeliharaanGedung.map((item) => item.gedung_id);

    return dataGedungFilter.map((item) => {
      const matchDataGedung = pemeliharaanGedungIds.includes(item.c_id_gedung);

      return {
        id: item.c_id_gedung,
        nama: item.c_nama_gedung ?? null,
        is_input: matchDataGedung,
      };
    });

  }

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

  async getPemeliharaanGedungDetail(params: PemeliharaanGedungDetailDto) {
    const now = new Date();
    const bulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const periode = now.getDate() <= 14 ? 1 : 2;
    const arrQuery = [];

    if (params.gedung_id) {
      arrQuery.push({
        gedung_id: params.gedung_id,
      });
    }

    if (params.bagian_gedung_detail_id) {
      arrQuery.push({
        bagian_gedung_detail_id: params.bagian_gedung_detail_id,
      });
    }

    const [data, total_data] = await Promise.all([
      this.prisma.pemeliharaan_gedung.findMany({
        where: {
          AND: arrQuery,
          bulan: bulan,
          periode: periode,
        },
        select: {
          id: true,
          image_url: true,
          updated_by: true,
          bagian_gedung_detail: {
            select: {
              nama: true
            }
          }
        },
      }),
      this.prisma.pemeliharaan_gedung.count({
        where: {
          AND: arrQuery,
          bulan: bulan,
          periode: periode,
        },
      }),
    ]);

    const nik = data.map((item) => item.updated_by).join(',')
    const respGoKaryawan = await this.httpService.get(
      `${process.env.SVC_DB_GO}/api/v1/karyawan/listNik?nik=${nik}`,
    );
    const dataKaryawan = respGoKaryawan?.data ?? [];

    return {
      total_data: total_data,
      data: data.map((item)=>{
        const findKaryawan = dataKaryawan.find((karyawan) => karyawan.c_nik === item.updated_by)
        return {
          id: item.id,
          image_url: item.image_url ?? null,
          updated_by: findKaryawan?.c_nama_lengkap ?? null,
          bagian_gedung_detail: item.bagian_gedung_detail?.nama ?? null
        }
      })
    };
  }

  async createPemeliharaanGedung(dto: CreatePemeliharaanGedungDto) {
    const now = new Date();
    const bulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const periode = now.getDate() <= 14 ? 1 : 2;

    const gedung_id = dto.data_pemeliharaan[0].gedung_id;
    const bagian_gedung_detail_id =
      dto.data_pemeliharaan[0].bagian_gedung_detail_id;

    const existingCount = await this.prisma.pemeliharaan_gedung.count({
      where: {
        gedung_id,
        bagian_gedung_detail_id,
        bulan,
        periode,
      },
    });

    const bagianDetail = await this.prisma.bagian_gedung_detail.findUnique({
      where: { id: bagian_gedung_detail_id },
      select: {
        nama: true,
        maks_foto: true,
      },
    });

    const totalUploads = existingCount + dto.data_pemeliharaan.length;
    if (existingCount == bagianDetail.maks_foto) {
      throw new CustomError(
        `Sudah ada (${existingCount}) dari maksimal (${bagianDetail.maks_foto}) data foto tersimpan untuk ${bagianDetail.nama}. ` +
          `Anda tidak bisa mengupload foto lagi di periode ini`,
        400,
      );
    }
    if (totalUploads > bagianDetail.maks_foto) {
      const remaining = bagianDetail.maks_foto - existingCount;
      throw new CustomError(
        `Sudah ada (${existingCount}) dari maksimal (${bagianDetail.maks_foto}) data foto tersimpan untuk ${bagianDetail.nama}. ` +
          `Anda hanya boleh upload ${remaining < 0 ? 0 : remaining} foto lagi di periode ini.`,
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
      image_url: item.image_url,
      updated_by: item.updated_by,
      bulan: bulan,
      periode: periode,
    }));

    await this.prisma.$transaction(async (tx) => {
      await tx.pemeliharaan_gedung.createMany({
        data: createData,
      });

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
          COUNT(DISTINCT bgd.id)::int AS count
          FROM bagian_gedung_detail bgd
          JOIN bagian_gedung_komponen bgk ON bgk.id = bgd.bagian_gedung_komponen_id 
          WHERE bgk.bagian_gedung_id = ${params.bagian_gedung_id}
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
