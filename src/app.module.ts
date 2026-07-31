import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { UnitsModule } from './units/units.module';
import { TenantsModule } from './tenants/tenants.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AuthModule,
    PropertiesModule,
    UnitsModule,
    TenantsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
