import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArtworkFields } from 'src/constants';
import { ArtworkEntity } from './artwork.entity';
import { ArtworkRepository } from './artwork.repository';

@Injectable()
export class ArtworkService {
    constructor(
        @InjectRepository(ArtworkEntity)
        private ArtworkRepository: ArtworkRepository
    ) {}

    async getAll(): Promise<any> {
        const artworks = await this.ArtworkRepository.find();

        if (!artworks.length) throw new NotFoundException({ message: 'No artworks found' });
        
        return {artworks, ...ArtworkFields.reduce((acc, filter) => {
            acc[`${filter}Filter`] = [...new Set(artworks.map((artwork) => artwork[filter]))];
            return acc;
          }, {}),
        };
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

    async findFiltered(nameFilter, artistFilter, styleFilter, museumFilter): Promise<any> {
        console.log('AAAAAA')
        const options = {
            name: nameFilter,
            artist: artistFilter,
            style: styleFilter,
            museum: museumFilter
        }

        console.log(options);

        const artworks: ArtworkEntity[] = await this.ArtworkRepository.find({where: options});

        if(!artworks.length) throw new NotFoundException({message: 'No artworks found'});
          
        return Object.keys(options).reduce(
            (acc, filter) => {
                acc[`${filter}Filter`] = [...new Set(artworks.map(
                    (artwork) => artwork[filter]
                ))];
                return acc;
                
            }, { artworks });
    }
}
