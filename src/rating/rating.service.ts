import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArtworkEntity } from 'src/artwork/artwork.entity';
import { ArtworkRepository } from 'src/artwork/artwork.repository';
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
        const res = await this.RatingRepository.query(`SELECT * FROM ratings WHERE artwork_id = ?`, [artworkId]);
        if(!res) throw new NotFoundException({message: 'No rating found'});
        return res;
    }

    async create(dto: RatingDTO): Promise<any> {
        const rating = this.RatingRepository.create(dto);
        rating.artwork = await this.ArtworkService.findById(dto.artwork_id);
        await this.RatingRepository.save(rating);
    }

    async delete(id: number): Promise<any> {
        const rating = await this.RatingRepository.query(`SELECT * FROM ratings WHERE id = ?`, [id]);
        await this.RatingRepository.delete(rating);
    }

    async update(id: number, dto: RatingDTO): Promise<any> {
        const rating = await this.RatingRepository.query(`SELECT * FROM ratings WHERE id = ?`, [id]);
        if (!rating.length) throw new NotFoundException({message: 'No rating found'});
        await this.RatingRepository.save(Object.assign(rating[0], dto));
    }

}
