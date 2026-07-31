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
import { AddUnitDto } from './dto/add-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { UnitsService } from './units.service';

@Controller('units')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  // GET /units or GET /units?propertyId=1
  @Get()
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  findAll(@Req() req: any, @Query('propertyId') propertyId?: string) {
    const userId = req.user.sub;
    const userRole = req.user.role;
    const parsedPropertyId = propertyId ? parseInt(propertyId, 10) : undefined;

    return this.unitsService.findAllUnits(userId, userRole, parsedPropertyId);
  }

  // GET /units/:id
  @Get(':id')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  getUnit(@Param('id', ParseIntPipe) unitId: number, @Req() req: any) {
    const userId = req.user.sub;
    const userRole = req.user.role;

    return this.unitsService.findUnitById(unitId, userId, userRole);
  }

  // POST /units
  @Post()
  @Roles('ADMIN', 'OWNER', 'MANAGER')
  addUnit(@Body() addUnitDto: AddUnitDto, @Req() req: any) {
    const userId = req.user.sub;
    const userRole = req.user.role;

    return this.unitsService.addUnit(addUnitDto, userId, userRole);
  }

  // PUT /units/:id
  @Put(':id')
  @Roles('ADMIN', 'OWNER', 'MANAGER')
  updateUnit(
    @Param('id', ParseIntPipe) unitId: number,
    @Req() req: any,
    @Body() updateUnitDto: UpdateUnitDto,
  ) {
    const userId = req.user.sub;
    const userRole = req.user.role;

    return this.unitsService.updateUnit(
      unitId,
      userId,
      userRole,
      updateUnitDto,
    );
  }

  // DELETE /units/:id
  @Delete(':id')
  @Roles('ADMIN', 'OWNER')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeUnit(@Param('id', ParseIntPipe) unitId: number, @Req() req: any) {
    const userId = req.user.sub;
    const userRole = req.user.role;

    return this.unitsService.deleteUnit(unitId, userId, userRole);
  }
}
