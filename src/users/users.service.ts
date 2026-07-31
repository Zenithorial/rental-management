import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { user } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private excludePassword(user: user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  //finds all user
  async findAll(): Promise<user[]> {
    return await this.prisma.user.findMany();
  }

  //Searches for a user id and returns their information
  async findUserByID(id: number): Promise<user> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User Not Found!');
    }

    return user;
  }

  //Searches for a user through their email
  async findUserByEmail(email: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      if (error == 'P2025') {
        throw new NotFoundException('User ${id} not found!');
      }
      throw error;
    }
  }

  //Creates new user
  async createUser(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        SALT_ROUNDS,
      );

      const newUser = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });

      return this.excludePassword(newUser);
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Email already in use!');
      }
      throw new error();
    }
  }

  //Updates user
  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    try {
      const dataToUpdate = { ...updateUserDto };

      if (dataToUpdate.password) {
        dataToUpdate.password = await bcrypt.hash(
          dataToUpdate.password,
          SALT_ROUNDS,
        );
      }

      return await this.prisma.user.update({
        where: { id },
        data: dataToUpdate,
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
