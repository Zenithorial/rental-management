import { Injectable, NotFoundException } from '@nestjs/common';
import { user } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  //finds all user
  async findAll(): Promise<user[]> {
    return await this.prisma.user.findMany();
  }

  //Searches for a user id and returns their information
  async findUser(id: number): Promise<user> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User Not Found!');
    }

    return user;
  }

  //Creates new user
  async createUser(createUserDto: CreateUserDto): Promise<user> {
    const newUser = await this.prisma.user.create({
      data: createUserDto,
    });

    return newUser;
  }

  //Updates user
  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch (error: any) {
      if (error == 'P2025') {
        throw new NotFoundException('User ${id} not found!');
      }
      throw error;
    }
  }

  async deleteUser(id: number) {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error == 'P2025') {
        throw new NotFoundException('User ${id} not found!');
      }
      throw error;
    }
  }
}
