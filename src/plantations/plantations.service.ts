import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePlantationDto } from './dto/create-plantation.dto';
import { UpdatePlantationDto } from './dto/update-plantation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ERROR_CODES, ERROR_MESSAGES } from 'src/constants';
import { AuthorizedUser } from 'src/auth/entities/authorized-user.entity';
import {
  BankAccountType,
  ChecksDeliveryMethod,
  PlantationDepartmanet,
  Prisma,
  TermsOfPayment,
} from '@prisma/client';
import { FilterPlantationDto } from './dto/filter-plantation.dto';
import { validate as uuidValidate } from 'uuid';
import { contains } from 'class-validator';

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
          postpaidCredit: data.postpaidCredit
            ? +data.postpaidCredit
            : undefined,
          postpaidDays: data.postpaidDays ? +data.postpaidDays : undefined,

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
                    bankAccountType:
                      transfer.bankAccountType as BankAccountType,
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

  async update(id: number, data: UpdatePlantationDto) {
    // console.log(data, 'data');

    // data.legalEntities.map((l) => {
    //   console.log(l, 'legalEntity');
    // });

    const updatedId = await this.prisma.$transaction(async (tx) => {
      const legalEntitiesToCreate = data.legalEntities.filter((c) =>
        uuidValidate(c.id),
      );
      const legalEntitiesToUpdate = data.legalEntities.filter(
        (c) => !uuidValidate(c.id),
      );

      const contactsToCreate = data.contacts.filter((c) => uuidValidate(c.id));
      const contactsToUpdate = data.contacts.filter((c) => !uuidValidate(c.id));

      const updated = await tx.plantation.update({
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
          postpaidCredit: data.postpaidCredit
            ? +data.postpaidCredit
            : undefined,
          postpaidDays: data.postpaidDays ? +data.postpaidDays : undefined,

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
            legalEntityData.transferDetails.filter((c) => !uuidValidate(c.id));

          const checksToCreate = legalEntityData.checks.filter((c) =>
            uuidValidate(c.id),
          );
          const checksToUpdate = legalEntityData.checks.filter(
            (c) => !uuidValidate(c.id),
          );

          // console.log(checksToCreate, 'checksToCreate');

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
                    name: transfer.name,
                    favourite: transfer.favourite,
                    beneficiary: transfer.beneficiary,
                    beneficiaryAddress: transfer.beneficiaryAddress,
                    // documentPath: transfer.documentPath,
                    bank: transfer.bank,
                    bankAddress: transfer.bankAddress,
                    bankAccountNumber: transfer.bankAccountNumber,
                    bankAccountType:
                      transfer.bankAccountType as BankAccountType,
                    bankSwift: transfer.bankSwift,
                    correspondentBank: transfer.correspondentBank,
                    correspondentBankAddress: transfer.correspondentBankAddress,
                    correspondentBankAccountNumber:
                      transfer.correspondentBankAccountNumber,
                    correspondentBankSwift: transfer.correspondentBankSwift,
                    plantationId: updated.id,
                  })),
                },
                updateMany: transferDetailsToUpdate.map((transfer) => ({
                  data: {
                    name: transfer.name,
                    favourite: transfer.favourite,
                    beneficiary: transfer.beneficiary,
                    beneficiaryAddress: transfer.beneficiaryAddress,
                    // documentPath: transfer.documentPath,
                    bank: transfer.bank,
                    bankAddress: transfer.bankAddress,
                    bankAccountNumber: transfer.bankAccountNumber,
                    bankAccountType:
                      transfer.bankAccountType as BankAccountType,
                    bankSwift: transfer.bankSwift,
                    correspondentBank: transfer.correspondentBank,
                    correspondentBankAddress: transfer.correspondentBankAddress,
                    correspondentBankAccountNumber:
                      transfer.correspondentBankAccountNumber,
                    correspondentBankSwift: transfer.correspondentBankSwift,
                    plantationId: updated.id,
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
                    // documentPath: check.documentPath,
                    favourite: check.favourite,
                    plantationId: updated.id,
                  })),
                },
                updateMany: checksToUpdate.map((check) => ({
                  data: {
                    name: check.name,
                    beneficiary: check.beneficiary,
                    // documentPath: check.documentPath,
                    favourite: check.favourite,
                    plantationId: updated.id,
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

      await Promise.allSettled(updateLegalEntityPromises);

      return updated.id;
    });

    return this.findOne(updatedId);
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
