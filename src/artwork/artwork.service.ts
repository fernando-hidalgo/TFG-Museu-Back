import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArtworkEntity } from './artwork.entity';
import { ArtworkRepository } from './artwork.repository';

@Injectable()
export class ArtworkService {
    constructor(
        @InjectRepository(ArtworkEntity)
        private ArtworkRepository: ArtworkRepository
    ) {}

    async getAll(): Promise<ArtworkEntity[]> {
        const res = await this.ArtworkRepository.find();
        if(!res.length) throw new NotFoundException({message: 'No artworks found'});
        return res;
    }

    async findById(id: number): Promise<ArtworkEntity> {
        const res = await this.ArtworkRepository.findOne({where: { id }});
        if(!res) throw new NotFoundException({message: 'No artwork found'});
        return res;
    }

    async findByName(name: string): Promise<ArtworkEntity> {
        const res = await this.ArtworkRepository.findOne({where: { name }});
        if(!res) throw new NotFoundException({message: 'No artwork found'});
        return res;
    }

    async findFiltered(filters) {
        const options = {
            name: filters.nameFilter,
            artist: filters.artistFilter,
            //style: filters.styleFilter,
            museum: filters.museumFilter
        }

        const artworks: ArtworkEntity[] = await this.ArtworkRepository.find({where: options});
          
        return Object.keys(options).reduce(
            (acc, filter) => {
                acc[`${filter}Filter`] = [...new Set(artworks.map(
                    (artwork) => artwork[filter]
                ))];
                return acc;
                
            }, { artworks });
    }
}
