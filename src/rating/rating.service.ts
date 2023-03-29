import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArtAndFilters } from 'src/app.interfaces';
import { ArtworkEntity } from 'src/artwork/artwork.entity';
import { ArtworkFields } from 'src/constants';
import { CreateRatingDTO } from './dto/create-rating.dto';
import { UpdateRatingDTO } from './dto/update-rating.dto';
import { RatingEntity } from './rating.entity';
import { RatingRepository } from './rating.repository';
import { ArtworkRepository } from '../artwork/artwork.repository';

@Injectable()
export class RatingService {
    constructor(
        @InjectRepository(RatingEntity)
        private RatingRepository: RatingRepository,

        @InjectRepository(ArtworkEntity)
        private ArtworkRepository: ArtworkRepository
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

    async findArtworkRatedByUser(userId: number): Promise<ArtAndFilters> {
        const userRatings = await this.ratedArtworks(userId)
        if(!userRatings) throw new NotFoundException({message: 'No artworks found'});
        const artworks = this.addUserRating(userRatings)
        return { artworks, ...this.artworkFilters(artworks) } as ArtAndFilters;
    }

    async findFilteredArtworkRatedByUser(nameFilter: string, artistFilter: string, styleFilter: string, museumFilter: string, userId: number): Promise<ArtAndFilters>{
        const options = {
            name: nameFilter,
            artist: artistFilter,
            style: styleFilter,
            museum: museumFilter
        }
        const userRatings = await this.ratedArtworks(userId)
        if(!userRatings) throw new NotFoundException({message: 'No artworks found'});
        const ratedArtworks = this.addUserRating(userRatings)
        const artworks = this.filterArtworksByOptions(ratedArtworks, options)
        return { artworks, ...this.artworkFilters(artworks) } as ArtAndFilters;
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

    /*HELPERS*/

    ratedArtworks(userId: number){
        return this.RatingRepository
        .createQueryBuilder('ratings')
        .innerJoin('ratings.artwork', 'artwork')
        .addSelect('artwork')
        .where("user_id = :userId", { userId })
        .getMany();
    }

    artworkFilters(artworks: ArtworkEntity[]){
        return ArtworkFields.reduce((acc, filter) => {
            acc[`${filter}Filter`] = [...new Set(artworks.map((artwork) => artwork[filter]))];
            return acc;
        }, {});
    }

    addUserRating(ratedArtworks): ArtworkEntity[]{
        return ratedArtworks.map((obj) => {
            obj.artwork.userRating = obj.value;
            return obj.artwork;
        });
    }

    async seen(userId: number, artworks: ArtworkEntity[]) {
        for (let i = 0; i < artworks.length; i++) {
            let artwork = artworks[i];
            let ratedByCurrentUser = await this.ArtworkRepository
                .createQueryBuilder('artworks')
                .innerJoin('artworks.ratings', 'ratings')
                .addSelect('ratings')
                .innerJoin('ratings.user', 'user')
                .addSelect('user.id')
                .where("artworks.id = :id", { id: artwork.id })
                .andWhere("ratings.user_id = :userId", { userId: userId })
                .getOne();
            artworks[i].seen = !!ratedByCurrentUser;
        }
        return artworks
    }

    filterArtworksByOptions(artworks: ArtworkEntity[], options): ArtworkEntity[] {
        const toCheck = {
            name: (artwork, options) => !options.name || artwork.name === options.name,
            artist: (artwork, options) => !options.artist || artwork.artist === options.artist,
            museum: (artwork, options) => !options.museum || artwork.museum === options.museum,
            style: (artwork, options) => !options.style || artwork.style === options.style
        };
          
        return artworks.filter(artwork => {
          return Object.keys(toCheck).every(key => {
            const filter = toCheck[key];
            return filter(artwork, options);
          });
        });
    }
}
