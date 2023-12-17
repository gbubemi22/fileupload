import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from './gurad/roles.guards';
import { JwtStrategy } from './gurad/jwt.strategy';
import { JwtGuard } from './gurad/jwt.gard';
import { UserService } from 'src/user/user.service';
import BcryptUtil from 'src/utils/bcrypt.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1d' },
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtGuard,
    JwtStrategy,
    RolesGuard,
    UserService,
    BcryptUtil,
    UserService,
  ],
})
export class AuthModule {}
