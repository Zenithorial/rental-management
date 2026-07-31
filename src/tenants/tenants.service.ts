import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddTenantDto } from './dto/add-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  //verify user has access to a unit thru its parent property
  private async verifyUnitAccess(
    unitId: number,
    userId: number,
    userRole: string,
  ) {
    const unit = await this.prisma.units.findUnique({
      where: { id: unitId },
    });

    if (!unit) {
      throw new NotFoundException(`Unit ID ${unitId} not found!`);
    }

    const property = await this.prisma.properties.findUnique({
      where: { id: unit.propertyId },
    });

    if (!property) {
      throw new NotFoundException(
        `Parent Property ID ${unit.propertyId} not found!`,
      );
    }

    if (
      userRole !== 'ADMIN' &&
      property.ownerId !== userId &&
      property.managerId !== userId
    ) {
      throw new ForbiddenException(
        'You do not have access to manage tenants in this unit/property',
      );
    }

    return { unit, property };
  }

  //find all tenants accessible to the user
  async findAllTenants(userId: number, userRole: string, propertyId?: number) {
    if (userRole === 'ADMIN') {
      if (propertyId) {
        const propertyUnits = await this.prisma.units.findMany({
          where: { propertyId },
          select: { id: true },
        });
        const unitIds = propertyUnits.map((u) => u.id);

        return this.prisma.tenants.findMany({
          where: { unitId: { in: unitIds } },
        });
      }

      return this.prisma.tenants.findMany();
    }

    const userProperties = await this.prisma.properties.findMany({
      where: {
        OR: [{ ownerId: userId }, { managerId: userId }],
      },
      select: { id: true },
    });

    const allowedPropertyIds = userProperties.map((p) => p.id);

    if (propertyId) {
      if (!allowedPropertyIds.includes(propertyId)) {
        throw new ForbiddenException('You do not have access to this property');
      }

      const propertyUnits = await this.prisma.units.findMany({
        where: { propertyId },
        select: { id: true },
      });
      const unitIds = propertyUnits.map((u) => u.id);

      return this.prisma.tenants.findMany({
        where: { unitId: { in: unitIds } },
      });
    }

    const userUnits = await this.prisma.units.findMany({
      where: { propertyId: { in: allowedPropertyIds } },
      select: { id: true },
    });

    const allowedUnitIds = userUnits.map((u) => u.id);

    return this.prisma.tenants.findMany({
      where: { unitId: { in: allowedUnitIds } },
    });
  }

  async findTenantById(tenantId: number, userId: number, userRole: string) {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant ID ${tenantId} not found!`);
    }

    await this.verifyUnitAccess(tenant.unitId, userId, userRole);

    return tenant;
  }

  //add new tenant and set unit status to OCCUPIED
  async addTenant(
    addTenantDto: AddTenantDto,
    userId: number,
    userRole: string,
  ) {
    await this.verifyUnitAccess(addTenantDto.unitId, userId, userRole);

    try {
      //using $transaction to create tenant and update unit status
      return await this.prisma.$transaction(async (tx) => {
        const newTenant = await tx.tenants.create({
          data: addTenantDto,
        });

        //auto update the unit status to OCCUPIED
        await tx.units.update({
          where: { id: addTenantDto.unitId },
          data: { status: 'OCCUPIED' },
        });

        return newTenant;
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `A tenant with this ${error.meta?.target?.[0] || 'email or phone number'} already exists!`,
        );
      }
      throw error;
    }
  }

  //also handles unit transfers and updates status for both old and new units)
  async updateTenant(
    tenantId: number,
    userId: number,
    userRole: string,
    updateTenantDto: UpdateTenantDto,
  ) {
    const currentTenant = await this.findTenantById(tenantId, userId, userRole);
    const oldUnitId = currentTenant.unitId;
    const newUnitId = updateTenantDto.unitId;

    if (newUnitId && newUnitId !== oldUnitId) {
      await this.verifyUnitAccess(newUnitId, userId, userRole);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const updatedTenant = await tx.tenants.update({
          where: { id: tenantId },
          data: updateTenantDto,
        });

        //if unit changed, change statuses for both old and new units
        if (newUnitId && newUnitId !== oldUnitId) {
          //the new unit is now occupied
          await tx.units.update({
            where: { id: newUnitId },
            data: { status: 'OCCUPIED' },
          });

          //checks if old unit has any remaining tenants
          const remainingTenantsInOldUnit = await tx.tenants.count({
            where: { unitId: oldUnitId },
          });

          //if no remaining tenants, mark old unit as avialable
          if (remainingTenantsInOldUnit === 0) {
            await tx.units.update({
              where: { id: oldUnitId },
              data: { status: 'AVAILABLE' },
            });
          }
        }

        return updatedTenant;
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `A tenant with this ${error.meta?.target?.[0] || 'email or phone number'} already exists!`,
        );
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Tenant ID ${tenantId} not found!`);
      }
      throw error;
    }
  }

  //delete tenant & set unit status to AVAILABLE if no remaining tenants
  async deleteTenant(tenantId: number, userId: number, userRole: string) {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant ID ${tenantId} not found!`);
    }

    const { property } = await this.verifyUnitAccess(
      tenant.unitId,
      userId,
      userRole,
    );

    return await this.prisma.$transaction(async (tx) => {
      const deletedTenant = await tx.tenants.delete({
        where: { id: tenantId },
      });

      const remainingTenants = await tx.tenants.count({
        where: { unitId: tenant.unitId },
      });

      if (remainingTenants === 0) {
        await tx.units.update({
          where: { id: tenant.unitId },
          data: { status: 'AVAILABLE' },
        });
      }

      return deletedTenant;
    });
  }
}
