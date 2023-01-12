import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArtworkService } from 'src/artwork/artwork.service';
import { RatingDTO } from './dto/rating.dto';
import { RatingEntity } from './rating.entity';
import { RatingRepository } from './rating.repository';

@Injectable()
export class RatingService {
    constructor(
        @InjectRepository(RatingEntity)
        private RatingRepository: RatingRepository,
        private ArtworkService: ArtworkService
    ) {}

    async getAll(): Promise<RatingEntity[]> {
        const res = await this.RatingRepository.find();
        if(!res.length) throw new NotFoundException({message: 'No artworks found'});
        return res;
    }

    async findByArtworkId(artworkId: number): Promise<RatingEntity[]> {
        const res = await this.RatingRepository
            .createQueryBuilder('ratings')
            .where("artwork_id = :artworkId", { artworkId: artworkId })
            .getMany();
        if(!res) throw new NotFoundException({message: 'No rating found'});
        return res;
    }

    async create(dto: RatingDTO): Promise<void> {
        const rating = this.RatingRepository.create(dto);
        rating.artwork = await this.ArtworkService.findById(dto.artwork_id);
        await this.RatingRepository.save(rating);
    }

    async delete(id: number): Promise<void> {
        const rating = await this.selectRating(id);
        if(!rating) throw new NotFoundException({message: 'No rating found'});
        await this.RatingRepository.delete(rating);
    }

    
    async update(id: number, dto: RatingDTO): Promise<void> {
        const rating = await this.selectRating(id);
        if (!rating) throw new NotFoundException({message: 'No rating found'});
        await this.RatingRepository.save(Object.assign(rating, dto));
    }

    //Helpers
    selectRating(id: number): Promise<RatingEntity> {
        return this.RatingRepository
        .createQueryBuilder('ratings')
        .where("id = :id", { id: id })
        .getOne();
        ;
    }

}
