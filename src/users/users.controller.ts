import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users
  //@Get()
  //findAll(): Promise<User[]> {
  //return this.usersService.findAll();
  //}

  // GET /users/:id
  @Get(':id')
  findUserId(@Param('id', ParseIntPipe) id: number) {
    return { id };
  }

  // POST /users
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return {
      name: createUserDto.name,
      role: createUserDto.role,
    };
  }

  // PUT /users/:id
  @Put(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return {
      id,
      ...updateUserDto,
    };
  }

  // DELETE /users/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeUser(@Param('id', ParseIntPipe) id: number) {}
}
