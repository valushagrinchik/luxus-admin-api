import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { CreatePlantationDto } from './dto/create-plantation.dto';
import { UpdatePlantationDto } from './dto/update-plantation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  COUNTRIES,
  ERROR_CODES,
  ERROR_MESSAGES,
  TERMS_OF_PAYMENTS,
} from 'src/constants';
import { AuthorizedUser } from 'src/auth/entities/authorized-user.entity';
import {
  ChecksDeliveryMethod,
  Plantation,
  PlantationDepartmanet,
  PlantationLegalEntity,
  Prisma,
  TermsOfPayment,
} from '@prisma/client';
import { FilterPlantationDto } from './dto/filter-plantation.dto';
import { validate as uuidValidate } from 'uuid';
import { Workbook } from 'exceljs';
import { omit, orderBy, pick } from 'lodash';
import { isRejected } from 'src/utils';

type FullPlantationsArray = (Plantation & {
  legalEntities: PlantationLegalEntity[];
})[];
@Injectable()
export class PlantationsService {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private prisma: PrismaService,
  ) {}

  async create(data: CreatePlantationDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const created = await tx.plantation.create({
          include: {
            legalEntities: true,
          },
          data: {
            ...pick(data, [
              'name',
              'country',
              'comments',
              'deliveryMethod',
              'deliveryInfo',
              'termsOfPayment',
            ]),
            postpaidCredit: +data.postpaidCredit,
            postpaidDays: +data.postpaidDays,

            legalEntities: {
              createMany: {
                data: data.legalEntities.map((legalEntity) => ({
                  ...pick(legalEntity, [
                    'name',
                    'code',
                    'legalAddress',
                    'actualAddress',
                  ]),
                })),
              },
            },

            contacts: {
              createMany: {
                data: data.contacts.map((contact) => omit(contact, 'id')),
              },
            },
          },
        });

        const updateLegalEntityPromises = created.legalEntities.map(
          (createdLegalEntity) => {
            const legalEntityData = data.legalEntities.find(
              (entity) => entity.name === createdLegalEntity.name,
            );

            return tx.plantationLegalEntity.update({
              where: {
                id: createdLegalEntity.id,
              },
              data: {
                transferDetails: {
                  createMany: {
                    data: legalEntityData.transferDetails.map((transfer) => ({
                      ...pick(transfer, [
                        'name',
                        'favourite',
                        'beneficiary',
                        'beneficiaryAddress',
                        'bank',
                        'bankAddress',
                        'bankAccountNumber',
                        'bankAccountType',
                        'bankSwift',
                        'correspondentBank',
                        'correspondentBankAddress',
                        'correspondentBankAccountNumber',
                        'correspondentBankSwift',
                      ]),
                      documentId: transfer.document?.id,
                      plantationId: created.id,
                    })),
                  },
                },
                checks: {
                  createMany: {
                    data: legalEntityData.checks.map((check) => ({
                      name: check.name,
                      beneficiary: check.beneficiary,
                      favourite: check.favourite,
                      documentId: check.document?.id,
                      plantationId: created.id,
                    })),
                  },
                },
              },
            });
          },
        );

        const results = await Promise.allSettled(updateLegalEntityPromises);
        const rejectedReasons = results.filter(isRejected).map((p) => p.reason);

        this.logger.warn(rejectedReasons, 'rejectedReasons');

        if (rejectedReasons.length) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              error: ERROR_CODES.OPERATION_FAILED,
              message: rejectedReasons,
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        return created.id;
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  findAll() {
    return this.prisma.plantation.findMany({
      where: { deleted: false },
      include: {
        legalEntities: {},
        contacts: true,
        transferDetails: {
          include: { document: true },
        },
        checks: {
          include: { document: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const plantation = await this.prisma.plantation.findUnique({
      where: { id, deleted: false },
      include: {
        legalEntities: true,
        contacts: true,
        transferDetails: {
          include: { document: true },
        },
        checks: {
          include: { document: true },
        },
      },
    });
    if (!plantation) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: ERROR_CODES.PLANTATION_NOT_FOUND,
        message: [ERROR_MESSAGES[ERROR_CODES.PLANTATION_NOT_FOUND]],
      });
    }
    return plantation;
  }

  buildSearchParams = (
    filter: FilterPlantationDto,
  ): Prisma.PlantationFindManyArgs => {
    return {
      where: {
        deleted: false,
        ...(filter.country
          ? {
              country: filter.country,
            }
          : {}),
        ...(filter.termsOfPayment
          ? {
              termsOfPayment: {
                in: filter.termsOfPayment
                  .split(',')
                  .map((t) => t as TermsOfPayment),
              },
            }
          : {}),
        ...(filter.type && filter.search
          ? {
              ...(filter.type === 'name'
                ? {
                    name: {
                      contains: filter.search,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  }
                : {}),
              ...(filter.type === 'legalEntityName'
                ? {
                    legalEntities: {
                      some: {
                        name: {
                          contains: filter.search,
                          mode: Prisma.QueryMode.insensitive,
                        },
                      },
                    },
                  }
                : {}),
            }
          : {}),
      },
    };
  };

  async searchTotal(filter: FilterPlantationDto) {
    const params: Prisma.PlantationFindManyArgs =
      this.buildSearchParams(filter);
    const res = await this.prisma.plantation.findMany(params);
    return res.length;
  }

  async search(
    filter: FilterPlantationDto & {
      offset?: number;
      limit?: number;
    },
  ): Promise<FullPlantationsArray> {
    const response = await this.prisma.plantation.findMany({
      ...this.buildSearchParams(filter),
      include: {
        legalEntities: true,
      },
      orderBy: {
        name: 'asc',
      },
      ...(filter.offset ? { skip: +filter.offset } : {}),
      ...(filter.limit ? { take: +filter.limit } : {}),
    });

    return orderBy(
      response,
      [(pl) => pl.name.toLowerCase()],
      ['asc'],
    ) as FullPlantationsArray;
  }

  async update(id: number, data: UpdatePlantationDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const legalEntitiesToCreate = data.legalEntities.filter((c) =>
          uuidValidate(c.id),
        );
        const legalEntitiesToUpdate = data.legalEntities.filter(
          (c) => !uuidValidate(c.id),
        );

        const contactsToCreate = data.contacts.filter((c) =>
          uuidValidate(c.id),
        );
        const contactsToUpdate = data.contacts.filter(
          (c) => !uuidValidate(c.id),
        );

        const updated = await tx.plantation.update({
          where: {
            id,
          },
          include: {
            legalEntities: true,
          },
          data: {
            ...(pick(data, [
              'name',
              'country',
              'comments',
              'deliveryMethod',
              'deliveryInfo',
              'termsOfPayment',
            ]) as Record<string, any>),
            postpaidCredit: +data.postpaidCredit,
            postpaidDays: +data.postpaidDays,

            legalEntities: {
              deleteMany: {
                NOT: {
                  id: { in: legalEntitiesToUpdate.map((e) => +e.id) },
                },
              },
              createMany: {
                data: legalEntitiesToCreate.map((legalEntity) => ({
                  name: legalEntity.name,
                  code: legalEntity.code,
                  legalAddress: legalEntity.legalAddress,
                  actualAddress: legalEntity.actualAddress,
                })),
              },
              updateMany: legalEntitiesToUpdate.map((legalEntity) => ({
                data: {
                  name: legalEntity.name,
                  code: legalEntity.code,
                  legalAddress: legalEntity.legalAddress,
                  actualAddress: legalEntity.actualAddress,
                },
                where: {
                  id: +legalEntity.id,
                },
              })),
            },
            contacts: {
              deleteMany: {
                NOT: {
                  id: { in: contactsToUpdate.map((e) => +e.id) },
                },
              },
              createMany: {
                data: contactsToCreate.map((contact) => ({
                  name: contact.name,
                  email: contact.email,
                  whatsapp: contact.whatsapp,
                  telegram: contact.telegram,
                  skype: contact.skype,
                  position: contact.position,
                  department: contact.department as PlantationDepartmanet,
                })),
              },
              updateMany: contactsToUpdate.map((contact) => ({
                data: {
                  name: contact.name,
                  email: contact.email,
                  whatsapp: contact.whatsapp,
                  telegram: contact.telegram,
                  skype: contact.skype,
                  position: contact.position,
                  department: contact.department as PlantationDepartmanet,
                },
                where: {
                  id: +contact.id,
                },
              })),
            },
          },
        });

        const updateLegalEntityPromises = updated.legalEntities.map(
          (createdLegalEntity) => {
            const legalEntityData = data.legalEntities.find(
              (entity) => entity.name === createdLegalEntity.name,
            );

            const transferDetailsToCreate =
              legalEntityData.transferDetails.filter((c) => uuidValidate(c.id));
            const transferDetailsToUpdate =
              legalEntityData.transferDetails.filter(
                (c) => !uuidValidate(c.id),
              );

            const checksToCreate = legalEntityData.checks.filter((c) =>
              uuidValidate(c.id),
            );
            const checksToUpdate = legalEntityData.checks.filter(
              (c) => !uuidValidate(c.id),
            );

            return tx.plantationLegalEntity.update({
              where: {
                id: createdLegalEntity.id,
              },
              data: {
                transferDetails: {
                  deleteMany: {
                    NOT: {
                      id: { in: transferDetailsToUpdate.map((e) => +e.id) },
                    },
                  },
                  createMany: {
                    data: transferDetailsToCreate.map((transfer) => ({
                      ...pick(transfer, [
                        'name',
                        'favourite',
                        'beneficiary',
                        'beneficiaryAddress',
                        'bank',
                        'bankAddress',
                        'bankAccountNumber',
                        'bankAccountType',
                        'bankSwift',
                        'correspondentBank',
                        'correspondentBankAddress',
                        'correspondentBankAccountNumber',
                        'correspondentBankSwift',
                      ]),
                      documentId: transfer.document?.id,
                      plantationId: updated.id,
                    })),
                  },
                  updateMany: transferDetailsToUpdate.map((transfer) => ({
                    data: {
                      ...pick(transfer, [
                        'name',
                        'favourite',
                        'beneficiary',
                        'beneficiaryAddress',
                        'bank',
                        'bankAddress',
                        'bankAccountNumber',
                        'bankAccountType',
                        'bankSwift',
                        'correspondentBank',
                        'correspondentBankAddress',
                        'correspondentBankAccountNumber',
                        'correspondentBankSwift',
                      ]),
                      documentId: transfer.document?.id,
                    },
                    where: {
                      id: +transfer.id,
                    },
                  })),
                },
                checks: {
                  deleteMany: {
                    NOT: {
                      id: { in: checksToUpdate.map((e) => +e.id) },
                    },
                  },
                  createMany: {
                    data: checksToCreate.map((check) => ({
                      name: check.name,
                      beneficiary: check.beneficiary,
                      favourite: check.favourite,
                      documentId: check.document?.id,
                      plantationId: updated.id,
                    })),
                  },

                  updateMany: checksToUpdate.map((check) => ({
                    data: {
                      name: check.name,
                      beneficiary: check.beneficiary,
                      favourite: check.favourite,
                      documentId: check.document?.id,
                    },
                    where: {
                      id: +check.id,
                    },
                  })),
                },
              },
            });
          },
        );

        const results = await Promise.allSettled(updateLegalEntityPromises);
        const rejectedReasons = results.filter(isRejected).map((p) => p.reason);

        this.logger.warn(rejectedReasons, 'rejectedReasons');

        if (rejectedReasons.length) {
          throw new HttpException(
            {
              statusCode: HttpStatus.BAD_REQUEST,
              error: ERROR_CODES.OPERATION_FAILED,
              message: rejectedReasons,
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        return updated.id;
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  remove(id: number, userId: number) {
    return this.prisma.plantation.update({
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
      where: {
        id,
        deleted: false,
      },
    });
  }

  cancel(id: number, user: AuthorizedUser) {
    return this.prisma.plantation.update({
      data: {
        deletedAt: null,
        deletedBy: null,
      },
      where: {
        id,
        ...(user.isAdmin()
          ? {}
          : {
              deleted: false,
              deletedBy: user.id,
            }),
      },
    });
  }

  async adminRemove(id: number, userId: number) {
    const plantation = await this.prisma.plantation.findUnique({
      where: { id, deleted: false },
    });
    if (!plantation) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          error: ERROR_CODES.PLANTATION_NOT_FOUND,
          message: [ERROR_MESSAGES[ERROR_CODES.PLANTATION_NOT_FOUND]],
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return this.prisma.plantation.update({
      data: {
        name: `${plantation.name}_${new Date().getTime()}`,
        // true means that admin approved the operation
        deleted: true,
        // set deletedAt and deletedBy if admin initiated removing or leave as is if not
        deletedAt: plantation.deletedAt || new Date(),
        deletedBy: plantation.deletedBy || userId,
      },
      where: {
        id,
      },
    });
  }

  async excel(filter: FilterPlantationDto) {
    const plantations = await this.search(filter);
    const workbook = new Workbook();

    const worksheet = workbook.addWorksheet('Fincas');

    worksheet.columns = [
      {
        header: '№',
        key: 'id',
        width: 10,
      },
      {
        header: 'País',
        key: 'country',
        width: 32,
      },
      {
        header: 'Nombre comercial',
        key: 'name',
        width: 32,
      },
      {
        header: 'Razón social',
        key: 'legacyName',
        width: 32,
      },
      {
        header: 'Condiciones de pago',
        key: 'termsOfPayment',
        width: 32,
      },
      {
        header: 'Monto de crédito',
        key: 'postpaidCredit',
        width: 32,
      },
      {
        header: 'Observaciones',
        key: 'comments',
        width: 32,
      },
    ];

    worksheet.getColumn(7).alignment = { vertical: 'top', wrapText: true };

    for (let i = 1; i <= worksheet.columnCount; i++) {
      worksheet.getColumn(i).font = { size: 14 };
    }

    const headerRow = worksheet.getRow(1);
    for (let i = 1; i <= headerRow.cellCount; i++) {
      headerRow.getCell(i).font = {
        size: 14,
        bold: true,
      };
    }

    const data: {
      id: number;
      country: string;
      name: string;
      legacyName: string;
      termsOfPayment: string;
      postpaidCredit: number;
      comments: string;
    }[] = [];
    for (const plantation of plantations) {
      data.push({
        id: plantation.id,
        country: COUNTRIES[plantation.country],
        name: plantation.name,
        legacyName: plantation.legalEntities.map((e) => e.name).join(', '),
        termsOfPayment: TERMS_OF_PAYMENTS[plantation.termsOfPayment],
        postpaidCredit: plantation.postpaidCredit || null,
        comments: plantation.comments,
      });
    }

    data.forEach((val) => {
      worksheet.addRow(val);
    });
    // await workbook.xlsx.writeFile('./public/Profile.xlsx');
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
