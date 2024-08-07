import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SortsModule } from './sorts/sorts.module';
import { ConfigModule } from '@nestjs/config';
import { GroupsModule } from './groups/groups.module';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthGuard } from './auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { CategoriesModule } from './categories/categories.module';
import { PlantationsModule } from './plantations/plantations.module';
import { JwtService } from '@nestjs/jwt';
import { UploadsModule } from './uploads/uploads.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SortsModule,
    GroupsModule,
    UsersModule,
    AuthModule,
    PrismaModule,
    CategoriesModule,
    PlantationsModule,
    UploadsModule,
    EventsModule,
  ],
  controllers: [AppController, AuthController],
  providers: [
    Logger,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AppService,
    UsersService,
    AuthService,
    JwtService,
  ],
})
export class AppModule {}
