import { Module } from '@nestjs/common';
import { ScrapingService } from './scraping.service';
import { ScrapingController } from './scraping.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworkEntity } from 'src/artwork/artwork.entity';
import { ArtworkService } from 'src/artwork/artwork.service';

@Module({
  imports: [TypeOrmModule.forFeature([ArtworkEntity])],
  providers: [ScrapingService, ArtworkService],
  controllers: [ScrapingController]
})
export class ScrapingModule {}
