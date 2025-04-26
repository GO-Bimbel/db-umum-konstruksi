import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ApiService } from 'src/api/api.service';
import {
  BagianGedungDto,
  DetailGedungDto,
  KomponenGedungDto,
  DetailListGedungDto,
  ImageDetailDto,
} from 'src/dto/master-gedung-dto';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MasterGedungService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: ApiService,
  ) {}

  async getBagian(params: BagianGedungDto) {
    const skip = params.page ? (params.page - 1) * params.per_page : 0;

    const where: Prisma.bagian_gedungWhereInput = {
      nama: {
        contains: params.keyword,
        mode: 'insensitive',
      },
    };

    const [data, total_data] = await Promise.all([
      this.prisma.bagian_gedung.findMany({
        where,
        skip: params.is_all_data ? undefined : skip,
        take: params.is_all_data ? undefined : params.per_page,
      }),
      this.prisma.bagian_gedung.count({
        where,
      }),
    ]);

    let dataEntri = [];
    if (params.gedung_id) {
      const now = new Date();
      const bulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const periode = now.getDate() <= 14 ? 1 : 2;

      const arrBagGedungId = data.map((item) => item.id);

      dataEntri = await this.prisma.$queryRaw`
          SELECT
              bg.id,
              count(*)::int as jml
          FROM pemeliharaan_gedung pg
          JOIN bagian_gedung_detail bgd ON bgd.id = pg.bagian_gedung_detail_id
          JOIN bagian_gedung_komponen bgk ON bgk.id = bgd.bagian_gedung_komponen_id
          JOIN bagian_gedung bg ON bg.id = bgk.bagian_gedung_id
          WHERE bg.id IN (${Prisma.join(arrBagGedungId)})
          AND pg.gedung_id = ${params.gedung_id}
          AND pg.bulan = ${bulan}
          AND pg.periode = ${periode}
          GROUP BY bg.id
      `;
    }

    return {
      total_data: total_data,
      data: data.map((item) => {
        const findDataEntri =
          dataEntri.find((entri) => entri.id == item.id)?.jml ?? 0;
        return {
          ...item,
          is_input: findDataEntri > 0 ? true : false,
        };
      }),
    };
  }

  async getKomponen(params: KomponenGedungDto) {
    const skip = params.page ? (params.page - 1) * params.per_page : 0;

    const where: Prisma.bagian_gedung_komponenWhereInput = {
      nama: {
        contains: params.keyword,
        mode: 'insensitive',
      },
      bagian_gedung_id: params.bagian_gedung_id,
    };

    const [data, total_data] = await Promise.all([
      this.prisma.bagian_gedung_komponen.findMany({
        where,
        skip: params.is_all_data ? undefined : skip,
        take: params.is_all_data ? undefined : params.per_page,
      }),
      this.prisma.bagian_gedung_komponen.count({
        where,
      }),
    ]);

    let dataEntri = [];
    if (params.gedung_id) {
      const now = new Date();
      const bulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const periode = now.getDate() <= 14 ? 1 : 2;

      const arrBagGedungKomponenId = data.map((item) => item.id);

      dataEntri = await this.prisma.$queryRaw`
          SELECT
              bgk.id,
              count(*)::int as jml
          FROM pemeliharaan_gedung pg
          JOIN bagian_gedung_detail bgd ON bgd.id = pg.bagian_gedung_detail_id
          JOIN bagian_gedung_komponen bgk ON bgk.id = bgd.bagian_gedung_komponen_id
          WHERE bgk.id IN (${Prisma.join(arrBagGedungKomponenId)})
          AND pg.gedung_id = ${params.gedung_id}
          AND pg.bulan = ${bulan}
          AND pg.periode = ${periode}
          GROUP BY bgk.id
      `;
    }

    return {
      total_data: total_data,
      data: data.map((item) => {
        const findDataEntri =
          dataEntri.find((entri) => entri.id == item.id)?.jml ?? 0;
        return {
          ...item,
          is_input: findDataEntri > 0 ? true : false,
        };
      }),
    };
  }

  async getDetail(params: DetailGedungDto) {
    const skip = params.page ? (params.page - 1) * params.per_page : 0;

    const where: Prisma.bagian_gedung_detailWhereInput = {
      nama: {
        contains: params.keyword,
        mode: 'insensitive',
      },
      bagian_gedung_komponen_id: params.bagian_gedung_komponen_id,
    };

    const [data, total_data] = await Promise.all([
      this.prisma.bagian_gedung_detail.findMany({
        where,
        skip: params.is_all_data ? undefined : skip,
        take: params.is_all_data ? undefined : params.per_page,
      }),
      this.prisma.bagian_gedung_detail.count({
        where,
      }),
    ]);

    let dataEntri = [];
    let dataKaryawanArr = [];
    if (params.gedung_id) {
      const now = new Date();
      const bulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const periode = now.getDate() <= 14 ? 1 : 2;

      const arrBagGedungDetailId = data.map((item) => item.id);

      dataEntri = await this.prisma.$queryRaw`
          SELECT
              pg.id,
              pg.bagian_gedung_detail_id,
              bgd.nama AS bagian_gedung_detail,
              pg.image_url,
              pg.updated_at,
              pg.updated_by
          FROM pemeliharaan_gedung pg
          JOIN bagian_gedung_detail bgd ON bgd.id = pg.bagian_gedung_detail_id
          WHERE pg.bagian_gedung_detail_id IN (${Prisma.join(arrBagGedungDetailId)})
          AND pg.gedung_id = ${params.gedung_id}
          AND pg.bulan = ${bulan}
          AND pg.periode = ${periode}
      `;

      if (dataEntri.length > 0) {
        const nik = dataEntri.map((item) => item.updated_by).join(',');
        const respGoKaryawan = await this.httpService.get(
          `${process.env.SVC_DB_GO}/api/v1/karyawan/listNik?nik=${nik}`,
        );
        dataKaryawanArr = respGoKaryawan?.data ?? [];
      }
    }

    return {
      total_data: total_data,
      data: data.map((item) => {
        const dataEntriArr = dataEntri.filter(
          (entri) => entri.bagian_gedung_detail_id == item.id,
        );
        return {
          ...item,
          sisa_maks_foto: item.maks_foto - dataEntriArr.length,
          is_input: dataEntriArr.length > 0,
          data_pemeliharaan_gedung: dataEntriArr.map((entri) => {
            const dataKaryawan = dataKaryawanArr.find(
              (karyawan) => karyawan.c_nik == entri.updated_by,
            );
            return {
              ...entri,
              updated_by: dataKaryawan?.c_nama_lengkap ?? null,
            };
          }),
        };
      }),
    };
  }
}
