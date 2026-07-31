import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { properties } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddPropertyDto } from './dto/add-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  //finds all properties that are owned by their owner
  async findAllProperties(userId: number, userRole: string) {
    //admin can fetch every property
    if (userRole === 'ADMIN') {
      return this.prisma.properties.findMany({
        // include: { units: true },
      });
    }

    //owner and managers can only get properties under their leadership
    return this.prisma.properties.findMany({
      where: {
        OR: [{ ownerId: userId }, { managerId: userId }],
      },
      // include: { units: true },
    });
  }

  //Searches for a user id and returns their information
  async findPropertyById(propertyId: number, userId: number, userRole: string) {
    const property = await this.prisma.properties.findFirst({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException(`Property ID ${propertyId} not found!`);
    }

    // check if user is eligible to check the property
    if (
      userRole !== 'ADMIN' &&
      property.ownerId !== userId &&
      property.managerId !== userId
    ) {
      throw new ForbiddenException('You do not have access to this property');
    }

    return property;
  }

  //Creates new user
  async addProperty(addPropertyDto: AddPropertyDto, ownerId: number) {
    try {
      const newProperty = await this.prisma.properties.create({
        data: {
          ...addPropertyDto,
          ownerId: ownerId,
        },
      });

      return newProperty;
    } catch (error: any) {
      throw new InternalServerErrorException(error);
    }
  }

  //Updates property
  async updateProperty(
    propertyId: number,
    userId: number,
    userRole: string,
    updatePropertyDto: UpdatePropertyDto,
  ) {
    //checking is property can be modified by user
    await this.findPropertyById(propertyId, userId, userRole);

    return this.prisma.properties.update({
      where: { id: propertyId },
      data: updatePropertyDto,
    });
  }

  //transfers property ownership (admin)
  async transferPropertyOwnership(propertyId: number, newOwnerId: number) {
    try {
      return await this.prisma.properties.update({
        where: { id: propertyId },
        data: { ownerId: newOwnerId },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Property ID ${propertyId} not found!`);
      }
      throw error;
    }
  }

  //transfers property manager (admin and owner)
  async transferPropertyManagement(propertyId: number, newManagerId: number) {
    try {
      return await this.prisma.properties.update({
        where: { id: propertyId },
        data: { managerId: newManagerId },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Property ID ${propertyId} not found!`);
      }
      throw error;
    }
  }

  async deleteProperty(propertyId: number, userId: number, userRole: string) {
    const property = await this.prisma.properties.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException(`Property ID ${propertyId} not found!`);
    }

    if (userRole !== 'ADMIN' && property.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this property',
      );
    }

    return this.prisma.properties.delete({
      where: { id: propertyId },
    });
  }
}
