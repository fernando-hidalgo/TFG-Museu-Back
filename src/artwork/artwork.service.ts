import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArtworkFields } from 'src/constants';
import { ArtworkEntity } from './artwork.entity';
import { ArtworkRepository } from './artwork.repository';
import { ArtworkDTO } from './dto/artwork.dto';

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

    async findFiltered(nameFilter, artistFilter, styleFilter, museumFilter): Promise<any> {
        const options = {
            name: nameFilter,
            artist: artistFilter,
            style: styleFilter,
            museum: museumFilter
        }

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

    async create(dto: ArtworkDTO): Promise<ArtworkEntity> {
        const artwork = this.ArtworkRepository.create(dto);
        await this.ArtworkRepository.save(artwork);
        return artwork
    }

    async delete(id: number): Promise<ArtworkEntity> {
        const artwork = await this.findById(id);
        if(!artwork) throw new NotFoundException({message: 'No artwork found'});
        await this.ArtworkRepository.delete(artwork as any);
        return artwork
    }
    
    async update(id: number, dto: ArtworkDTO): Promise<ArtworkEntity> {
        const artwork = await this.findById(id);
        if (!artwork) throw new NotFoundException({message: 'No artwork found'});
        await this.ArtworkRepository.save(Object.assign(artwork, dto));
        return artwork
    }
}
