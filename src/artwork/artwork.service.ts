import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArtAndFilters } from 'src/app.interfaces';
import { ArtworkFields } from 'src/constants';
import { ArtworkEntity } from './artwork.entity';
import { ArtworkRepository } from './artwork.repository';
import { ArtworkDTO } from './dto/artwork.dto';

@Injectable()
export class ArtworkService {
    constructor(
        @InjectRepository(ArtworkEntity)
        private ArtworkRepository: ArtworkRepository
    ) { }

    async getAll(userId: number): Promise<ArtAndFilters> {
        let artworks = await this.ArtworkRepository.find();
        artworks = await this.seen(userId, artworks)
        if (!artworks.length) throw new NotFoundException({ message: 'No artworks found' });
        return { artworks, ...this.artworkFilters(artworks) } as ArtAndFilters;
    }

    //TODO: Eliminar si no se usa aqui, estará en Scrapping Service
    async findById(id: number): Promise<ArtworkEntity> {
        const res = await this.ArtworkRepository.findOne({ where: { id } });
        //if (!res) throw new NotFoundException({ message: 'No artwork found' });
        return res;
    }

    async findFiltered(nameFilter, artistFilter, styleFilter, museumFilter, userId): Promise<ArtAndFilters> {
        const options = {
            name: nameFilter,
            artist: artistFilter,
            style: styleFilter,
            museum: museumFilter
        }
        let artworks: ArtworkEntity[] = await this.ArtworkRepository.find({ where: options });
        artworks = await this.seen(userId, artworks)
        if (!artworks.length) throw new NotFoundException({ message: 'No artworks found' });
        return { artworks, ...this.artworkFilters(artworks) } as ArtAndFilters;
    }

    /*HELPERS*/

    artworkFilters(artworks: ArtworkEntity[]){
        return ArtworkFields.reduce((acc, filter) => {
            acc[`${filter}Filter`] = [...new Set(artworks.map((artwork) => artwork[filter]))];
            return acc;
        }, {});
    }

    async seen(userId: number, artworks: ArtworkEntity[]) {
        for (let i = 0; i < artworks.length; i++) {
            let artwork = artworks[i];
            let ratedByCurrentUser = await this.ArtworkRepository
                .createQueryBuilder('artworks')
                .innerJoinAndSelect('artworks.ratings', 'ratings')
                .innerJoin('ratings.user', 'user')
                .addSelect('user.id')
                .where("artworks.id = :id", { id: artwork.id })
                .andWhere("ratings.user_id = :userId", { userId: userId })
                .getOne();
            artworks[i].seen = !!ratedByCurrentUser;
        }
        return artworks
    }
}
