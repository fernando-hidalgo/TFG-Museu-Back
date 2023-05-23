import { Module } from '@nestjs/common';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingEntity } from './rating.entity';
import { ArtworkService } from 'src/artwork/artwork.service';
import { ArtworkEntity } from 'src/artwork/artwork.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RatingEntity, ArtworkEntity])],
  providers: [RatingService, ArtworkService],
  controllers: [RatingController]
})
export class RatingModule {}
