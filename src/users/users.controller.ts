import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Req,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users
  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  getSelfInfo(@Req() req) {
    const userId = req.user.sub;

    return this.usersService.findUserByID(userId);
  }

  // GET /users/:id
  @Get(':id')
  @Roles('ADMIN')
  findUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findUserByID(id);
  }

  // POST /users
  @Post()
  @Roles('ADMIN')
  createUser(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Put('edit')
  updateSelf(
    @Req() req: any,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
  ) {
    const userId = req.user.sub;
    return this.usersService.updateUser(userId, updateUserDto);
  }

  // PUT /users/:id
  @Put(':id')
  @Roles('ADMIN')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  // DELETE /users/:id
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}
