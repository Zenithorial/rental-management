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
  Query,
  UseGuards,
} from '@nestjs/common';
import { AddTenantDto } from './dto/add-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { TenantsService } from './tenants.service';

@Controller('tenants')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  //GET /tenants or GET /tenants?propertyId=1
  @Get()
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  findAll(@Req() req: any, @Query('propertyId') propertyId?: string) {
    const userId = req.user.sub;
    const userRole = req.user.role;
    const parsedPropertyId = propertyId ? parseInt(propertyId, 10) : undefined;

    return this.tenantsService.findAllTenants(
      userId,
      userRole,
      parsedPropertyId,
    );
  }

  //GET /tenants/:id
  @Get(':id')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  getTenant(@Param('id', ParseIntPipe) tenantId: number, @Req() req: any) {
    const userId = req.user.sub;
    const userRole = req.user.role;

    return this.tenantsService.findTenantById(tenantId, userId, userRole);
  }

  //POST /tenants
  @Post()
  @Roles('ADMIN', 'OWNER', 'MANAGER')
  addTenant(@Body() addTenantDto: AddTenantDto, @Req() req: any) {
    const userId = req.user.sub;
    const userRole = req.user.role;

    return this.tenantsService.addTenant(addTenantDto, userId, userRole);
  }

  @Put(':id') //PUT /tenants/:id
  @Roles('ADMIN', 'OWNER', 'MANAGER')
  updateTenant(
    @Param('id', ParseIntPipe) tenantId: number,
    @Req() req: any,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    const userId = req.user.sub;
    const userRole = req.user.role;

    return this.tenantsService.updateTenant(
      tenantId,
      userId,
      userRole,
      updateTenantDto,
    );
  }

  //DELETE  /tenants/:id
  @Delete(':id')
  @Roles('ADMIN', 'OWNER', 'MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTenant(@Param('id', ParseIntPipe) tenantId: number, @Req() req: any) {
    const userId = req.user.sub;
    const userRole = req.user.role;

    return this.tenantsService.deleteTenant(tenantId, userId, userRole);
  }
}
