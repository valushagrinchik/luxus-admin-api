import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    SortsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GroupsModule,
    UsersModule,
    AuthModule,
    PrismaModule,
  ],
  controllers: [AppController, AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AppService,
    UsersService,
    AuthService,
  ],
})
export class AppModule {}
