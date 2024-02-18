import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePlantationDto } from './dto/create-plantation.dto';
import { UpdatePlantationDto } from './dto/update-plantation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ERROR_CODES, ERROR_MESSAGES } from 'src/constants';
import { AuthorizedUser } from 'src/auth/entities/authorized-user.entity';
import {
  ChecksDeliveryMethod,
  PlantationDepartmanet,
  Prisma,
  TermsOfPayment,
} from '@prisma/client';
import { FilterPlantationDto } from './dto/filter-plantation.dto';

@Injectable()
export class PlantationsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreatePlantationDto) {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.plantation.create({
        include: {
          legalEntities: true,
        },
        data: {
          name: data.name,
          country: data.country,
          comments: data.comments,
          deliveryMethod: data.deliveryMethod as ChecksDeliveryMethod,
          termsOfPayment: data.termsOfPayment as TermsOfPayment,
          postpaidCredit: data.postpaidCredit,
          postpaidDays: data.postpaidDays,

          legalEntities: {
            createMany: {
              data: data.legalEntities.map((legalEntity) => ({
                name: legalEntity.name,
                code: legalEntity.code,
                legalAddress: legalEntity.legalAddress,
                actualAddress: legalEntity.actualAddress,
              })),
            },
          },

          transferDetails: {},
          checks: {},

          contacts: {
            createMany: {
              data: data.contacts.map((contact) => ({
                name: contact.name,
                email: contact.email,
                whatsapp: contact.whatsapp,
                telegram: contact.telegram,
                skype: contact.skype,
                position: contact.position,
                department: contact.department as PlantationDepartmanet,
              })),
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
                    name: transfer.name,
                    favourite: transfer.favourite,
                    beneficiary: transfer.beneficiary,
                    beneficiaryAddress: transfer.beneficiaryAddress,
                    documentPath: transfer.documentPath,
                    bank: transfer.bank,
                    bankAddress: transfer.bankAddress,
                    bankAccountNumber: transfer.bankAccountNumber,
                    bankAccountType: transfer.bankAccountType,
                    bankSwift: transfer.bankSwift,
                    correspondentBank: transfer.correspondentBank,
                    correspondentBankAddress: transfer.correspondentBankAddress,
                    correspondentBankAccountNumber:
                      transfer.correspondentBankAccountNumber,
                    correspondentBankSwift: transfer.correspondentBankSwift,
                    plantationId: created.id,
                  })),
                },
              },
              checks: {
                createMany: {
                  data: legalEntityData.checks.map((check) => ({
                    name: check.name,
                    beneficiary: check.beneficiary,
                    documentPath: check.documentPath,
                    favourite: check.favourite,
                    plantationId: created.id,
                  })),
                },
              },
            },
          });
        },
      );

      await Promise.allSettled(updateLegalEntityPromises);

      return this.findOne(created.id);
    });
  }

  findAll() {
    return this.prisma.plantation.findMany({
      where: { deleted: false },
      include: {
        legalEntities: true,
        contacts: true,
        transferDetails: true,
        checks: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.plantation.findUnique({
      where: { id, deleted: false },
      include: {
        legalEntities: true,
        contacts: true,
        transferDetails: true,
        checks: true,
      },
    });
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
      },
      include: {
        legalEntities: true,
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
      offset: number;
      limit: number;
    },
  ) {
    const params: Prisma.PlantationFindManyArgs =
      this.buildSearchParams(filter);
    return this.prisma.plantation.findMany({
      ...params,
      orderBy: {
        name: 'asc',
      },
      skip: +filter.offset,
      take: +filter.limit,
    });
  }

  update(id: number, data: UpdatePlantationDto) {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.plantation.update({
        where: {
          id,
        },
        include: {
          legalEntities: true,
        },
        data: {
          name: data.name,
          country: data.country,
          comments: data.comments,
          deliveryMethod: data.deliveryMethod as ChecksDeliveryMethod,
          termsOfPayment: data.termsOfPayment as TermsOfPayment,
          postpaidCredit: data.postpaidCredit,
          postpaidDays: data.postpaidDays,

          legalEntities: {
            deleteMany: {},
            createMany: {
              data: data.legalEntities.map((legalEntity) => ({
                name: legalEntity.name,
                code: legalEntity.code,
                legalAddress: legalEntity.legalAddress,
                actualAddress: legalEntity.actualAddress,
              })),
            },
          },

          transferDetails: {},
          checks: {},

          contacts: {
            deleteMany: {},
            createMany: {
              data: data.contacts.map((contact) => ({
                name: contact.name,
                email: contact.email,
                whatsapp: contact.whatsapp,
                telegram: contact.telegram,
                skype: contact.skype,
                position: contact.position,
                department: contact.department as PlantationDepartmanet,
              })),
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
                deleteMany: {},
                createMany: {
                  data: legalEntityData.transferDetails.map((transfer) => ({
                    name: transfer.name,
                    favourite: transfer.favourite,
                    beneficiary: transfer.beneficiary,
                    beneficiaryAddress: transfer.beneficiaryAddress,
                    documentPath: transfer.documentPath,
                    bank: transfer.bank,
                    bankAddress: transfer.bankAddress,
                    bankAccountNumber: transfer.bankAccountNumber,
                    bankAccountType: transfer.bankAccountType,
                    bankSwift: transfer.bankSwift,
                    correspondentBank: transfer.correspondentBank,
                    correspondentBankAddress: transfer.correspondentBankAddress,
                    correspondentBankAccountNumber:
                      transfer.correspondentBankAccountNumber,
                    correspondentBankSwift: transfer.correspondentBankSwift,
                    plantationId: created.id,
                  })),
                },
              },
              checks: {
                deleteMany: {},
                createMany: {
                  data: legalEntityData.checks.map((check) => ({
                    name: check.name,
                    beneficiary: check.beneficiary,
                    documentPath: check.documentPath,
                    favourite: check.favourite,
                    plantationId: created.id,
                  })),
                },
              },
            },
          });
        },
      );

      await Promise.allSettled(updateLegalEntityPromises);

      return this.findOne(created.id);
    });
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
}
