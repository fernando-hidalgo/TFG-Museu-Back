import { Module } from '@nestjs/common';
import { ArtworkService } from './artwork.service';
import { ArtworkController } from './artwork.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworkEntity } from './artwork.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArtworkEntity])],
  providers: [ArtworkService],
  controllers: [ArtworkController]
})
export class ArtworkModule {}
