import { Module } from '@nestjs/common';
import { ScrappingService } from './scrapping.service';
import { ScrappingController } from './scrapping.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworkEntity } from 'src/artwork/artwork.entity';
import { ArtworkService } from 'src/artwork/artwork.service';

@Module({
  imports: [TypeOrmModule.forFeature([ArtworkEntity])],
  providers: [ScrappingService, ArtworkService],
  controllers: [ScrappingController]
})
export class ScrappingModule {}
