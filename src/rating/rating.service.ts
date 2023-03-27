import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArtworkService } from 'src/artwork/artwork.service';
import { CreateRatingDTO } from './dto/create-rating.dto';
import { UpdateRatingDTO } from './dto/update-rating.dto';
import { RatingEntity } from './rating.entity';
import { RatingRepository } from './rating.repository';

@Injectable()
export class RatingService {
    constructor(
        @InjectRepository(RatingEntity)
        private RatingRepository: RatingRepository
    ) {}

    async getAll(): Promise<RatingEntity[]> {
        const res = await this.RatingRepository.find();
        if(!res.length) throw new NotFoundException({message: 'No artworks found'});
        return res;
    }

    async findById(id: number): Promise<RatingEntity> {
        const res = await this.RatingRepository
            .createQueryBuilder('ratings')
            .innerJoin('ratings.user', 'user')
            .addSelect('user.id').addSelect('user.nickname') //TODO: .addSelect('user.profilePic')
            .where("ratings.id = :id", { id })
            .getOne();
        if(!res) throw new NotFoundException({message: 'No rating found'});
        return res;
    }

    async findByArtworkId(artworkId: number): Promise<RatingEntity[]> {
        const res = await this.RatingRepository
            .createQueryBuilder('ratings')
            .innerJoin('ratings.user', 'user')
            .addSelect('user.id').addSelect('user.nickname') //TODO: .addSelect('user.profilePic')
            .where("artwork_id = :artworkId", { artworkId })
            .getMany();
        if(!res) throw new NotFoundException({message: 'No rating found'});
        return res;
    }

    async findArtworkByUserId(userId: number): Promise<RatingEntity[]> {
        const res = await this.RatingRepository
            .createQueryBuilder('ratings')
            .innerJoin('ratings.artwork', 'artwork')
            .addSelect('artwork.id').addSelect('artwork.picLink').addSelect('artwork.averageRating')
            .where("user_id = :userId", { userId })
            .getMany();
        if(!res) throw new NotFoundException({message: 'No rating found'});
        return res;
    }

    async create(dto: CreateRatingDTO): Promise<RatingEntity> {
        const rating = this.RatingRepository.create(dto);
        const alreadyRated = await this.RatingRepository
            .createQueryBuilder('ratings')
            .where("artwork_id = :artworkId", { artworkId: rating.artwork })
            .andWhere("user_id = :userId", { userId: rating.user })
            .getMany()
        if(alreadyRated.length) throw new NotFoundException({message: 'Current user already rated this artwork'});
        await this.RatingRepository.save(rating);
        return rating
    }

    async delete(id: number): Promise<RatingEntity> {
        const rating = await this.findById(id);
        if(!rating) throw new NotFoundException({message: 'No rating found'});
        await this.RatingRepository.delete(rating as any);
        return rating
    }
    
    async update(id: number, dto: UpdateRatingDTO): Promise<RatingEntity> {
        const rating = await this.findById(id);
        if (!rating) throw new NotFoundException({message: 'No rating found'});
        await this.RatingRepository.save(Object.assign(rating, dto));
        return rating
    }
}
