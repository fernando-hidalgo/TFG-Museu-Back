import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworkEntity } from 'src/artwork/artwork.entity';
import { ArtListController } from './art-list.controller';
import { ArtListEntity } from './art-list.entity';
import { ArtListService } from './art-list.service';
import { UserEntity } from 'src/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArtListEntity, ArtworkEntity, UserEntity])],
  controllers: [ArtListController],
  providers: [ArtListService]
})
export class ArtListModule {}
