import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { AuthRepository } from './auth.repository';
import { PassportModule } from '@nestjs/passport';
import { JWT_SECRET } from './../constants';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AuthRepository]),
    PassportModule.register({
      defaultStrategy: 'jwt'
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get(JWT_SECRET),
        signOptions: {
          expiresIn: 7200
        }
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, ConfigService],
  controllers: [AuthController],
  exports: [PassportModule]
})
export class AuthModule {}
