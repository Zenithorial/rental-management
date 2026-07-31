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
import { AddPropertyDto } from './dto/add-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { PropertiesService } from './properties.service';

@Controller('properties')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  // GET /properties
  @Get()
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  findAll(@Req() req: any) {
    const userId = req.user.sub;
    const userRole = req.user.role;
    return this.propertiesService.findAllProperties(userId, userRole);
  }

  @Get(':id') // grabs a property thru a specific id
  getProperty(@Param('id', ParseIntPipe) propertyId: number, @Req() req: any) {
    const userId = req.user.sub;
    const userRole = req.user.role;
    return this.propertiesService.findPropertyById(
      propertyId,
      userId,
      userRole,
    );
  }

  @Post()
  @Roles('ADMIN', 'OWNER')
  addProperty(
    @Body(new ValidationPipe()) addPropertyDto: AddPropertyDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    return this.propertiesService.addProperty(addPropertyDto, userId);
  }

  @Put(':id')
  @Roles('ADMIN', 'OWNER', 'ADMIN')
  updateProperty(
    @Param('id', ParseIntPipe) propertyId: number,
    @Req() req: any,
    @Body(new ValidationPipe()) updateUserDto: UpdatePropertyDto,
  ) {
    const userId = req.user.sub;
    const userRole = req.user.role;
    return this.propertiesService.updateProperty(
      propertyId,
      userId,
      userRole,
      updateUserDto,
    );
  }

  @Put(':id/transfer-ownership')
  @Roles('ADMIN')
  transferOwnership(
    @Param('id', ParseIntPipe) propertyId: number,
    @Body('newOwnerId', ParseIntPipe) newOwnerId: number,
  ) {
    return this.propertiesService.transferPropertyOwnership(
      propertyId,
      newOwnerId,
    );
  }

  @Put(':id/transfer-management')
  @Roles('ADMIN', 'OWNER')
  transferManagement(
    @Param('id', ParseIntPipe) propertyId: number,
    @Body('newManagerId', ParseIntPipe) newManagerId: number,
  ) {
    return this.propertiesService.transferPropertyManagement(
      propertyId,
      newManagerId,
    );
  }

  // DELETE /properties/:id
  @Delete(':id')
  @Roles('ADMIN', 'OWNER')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeUser(@Param('id', ParseIntPipe) propertyId: number, @Req() req: any) {
    const userId = req.user.sub;
    const userRole = req.user.role;
    return this.propertiesService.deleteProperty(propertyId, userId, userRole);
  }
}
