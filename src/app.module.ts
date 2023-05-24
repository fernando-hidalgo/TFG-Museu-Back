import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworkModule } from './artwork/artwork.module';
import { RatingModule } from './rating/rating.module';
import { ArtListModule } from './art-list/art-list.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { AuthModule } from './auth/auth.module';
import { ScrapingModule } from './scraping/scraping.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DB_HOST || "localhost",
        port: +process.env.DB_PORT || 3306,
        username: process.env.DB_USER ||"root",
        password: process.env.DB_PASSWORD ||"museu",
        database: process.env.DB_NAME ||"museu",
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ArtworkModule,
    RatingModule,
    ArtListModule,
    UserModule,
    RoleModule,
    AuthModule,
    ScrapingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
