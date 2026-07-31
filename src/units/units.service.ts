import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddUnitDto } from './dto/add-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

  //making ssure the user has authority over the parent property
  private async verifyPropertyAccess(
    propertyId: number,
    userId: number,
    userRole: string,
  ) {
    const property = await this.prisma.properties.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException(`Property ID ${propertyId} not found!`);
    }

    if (
      userRole !== 'ADMIN' &&
      property.ownerId !== userId &&
      property.managerId !== userId
    ) {
      throw new ForbiddenException(
        'You do not have access to manage units in this property',
      );
    }

    return property;
  }

  async findAllUnits(userId: number, userRole: string, propertyId?: number) {
    if (userRole === 'ADMIN') {
      return this.prisma.units.findMany({
        where: propertyId ? { propertyId } : {},
      });
    }

    //for the owners and managers, fetch properties they manage first
    const userProperties = await this.prisma.properties.findMany({
      where: {
        OR: [{ ownerId: userId }, { managerId: userId }],
      },
      select: { id: true },
    });

    const allowedPropertyIds = userProperties.map((p) => p.id);

    //if specific propertyId was requested, make sure they own/manage it
    if (propertyId) {
      if (!allowedPropertyIds.includes(propertyId)) {
        throw new ForbiddenException('You do not have access to this property');
      }
      return this.prisma.units.findMany({ where: { propertyId } });
    }

    //return units across all properties they control
    return this.prisma.units.findMany({
      where: {
        propertyId: { in: allowedPropertyIds },
      },
    });
  }

  //find a specific unit by ID and verify access via parent property
  async findUnitById(unitId: number, userId: number, userRole: string) {
    const unit = await this.prisma.units.findUnique({
      where: { id: unitId },
    });

    if (!unit) {
      throw new NotFoundException(`Unit ID ${unitId} not found!`);
    }

    //check parent property permissions
    await this.verifyPropertyAccess(unit.propertyId, userId, userRole);

    return unit;
  }

  //creates a new unit after checking property permissions
  async addUnit(addUnitDto: AddUnitDto, userId: number, userRole: string) {
    await this.verifyPropertyAccess(addUnitDto.propertyId, userId, userRole);

    return this.prisma.units.create({
      data: addUnitDto,
    });
  }

  //updates a unit after verifying access
  async updateUnit(
    unitId: number,
    userId: number,
    userRole: string,
    updateUnitDto: UpdateUnitDto,
  ) {
    //verify unit exists and if user can edit
    await this.findUnitById(unitId, userId, userRole);

    return this.prisma.units.update({
      where: { id: unitId },
      data: updateUnitDto,
    });
  }

  //deletes a unit
  async deleteUnit(unitId: number, userId: number, userRole: string) {
    const unit = await this.prisma.units.findUnique({
      where: { id: unitId },
    });

    if (!unit) {
      throw new NotFoundException(`Unit ID ${unitId} not found!`);
    }

    const property = await this.verifyPropertyAccess(
      unit.propertyId,
      userId,
      userRole,
    );

    if (userRole !== 'ADMIN' && property?.ownerId !== userId) {
      throw new ForbiddenException(
        'Only the property owner or an admin can delete units',
      );
    }

    return this.prisma.units.delete({
      where: { id: unitId },
    });
  }
}
