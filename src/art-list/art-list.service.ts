import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArtAndFilters } from 'src/app.interfaces';
import { ArtworkEntity } from 'src/artwork/artwork.entity';
import { ArtworkFields } from 'src/constants';
import { ArtListEntity } from './art-list.entity';
import { ArtListRepository } from './art-list.repository';
import { ArtworkRepository } from '../artwork/artwork.repository';
import { CreateArtListDTO } from './dto/create-art-list.dto';
import { UpdateArtListDTO } from './dto/update-art-list.dto';
import { In, Not } from 'typeorm';

@Injectable()
export class ArtListService {
    NodeGeocoder = require('node-geocoder');
    options = {provider: 'openstreetmap'};
    geocoder = this.NodeGeocoder(this.options);

    constructor(
        @InjectRepository(ArtListEntity)
        private ArtListRepository: ArtListRepository,

        @InjectRepository(ArtworkEntity)
        private ArtworkRepository: ArtworkRepository
    ) {}

    async getAll(): Promise<ArtListEntity[]> {
        const res = await this.ArtListRepository.find();
        if(!res.length) throw new NotFoundException({message: 'No lists found'});
        return res;
    }

    async findById(artlistId: number, currentUserId: number): Promise<ArtAndFilters> {
        let list = await this.ArtListRepository
        .createQueryBuilder('art_lists')
        .leftJoinAndSelect("art_lists.artworks", "artwork")
        .where("art_lists.id = :id", { id: artlistId })
        .getOne();
        
        if(!list) throw new NotFoundException({message: 'No list found'});
        let artworks = list.artworks
        artworks = await this.seen(currentUserId, artworks)
        artworks = await this.addGeo(artworks)
        //TODO: Debe tambien devolver el nombre y descripcción de la lista
        return { artworks, ...this.artworkFilters(list.artworks) } as ArtAndFilters ;
    }

    async findListToEdit(artlistId: number, body?: any) {
        let list = await this.ArtListRepository
            .createQueryBuilder('art_lists')
            .leftJoinAndSelect("art_lists.artworks", "artwork")
            .where("art_lists.id = :id", { id: artlistId })
            .getOne();
        if (!list) throw new NotFoundException({ message: 'No list found' });

        let artworksInList: ArtworkEntity[];
        if (body?.currentArtworks) {
            artworksInList = body.currentArtworks
        } else {
            artworksInList = list.artworks
        }

        const namesInList: string[] = artworksInList.map(artwork => artwork.name);
        const artworksToSuggest: ArtworkEntity[] = await this.ArtworkRepository.findBy({
            name: Not(In(namesInList))
        });
        const artworksIds = artworksToSuggest.map(artwork => artwork.id);
        const filters = this.artworkFilters(artworksToSuggest);

        return {
            name: list.name,
            description: list.text,
            artworks: artworksInList,
            nameFilter: filters['nameFilter'],
            artworksIds,
        };
    }

    async findFilteredInList(artlistId, nameFilter, artistFilter, styleFilter, museumFilter, currentUserId){
        const options = {
            name: nameFilter,
            artist: artistFilter,
            style: styleFilter,
            museum: museumFilter
        }

        let list = await this.ArtListRepository
        .createQueryBuilder('art_lists')
        .innerJoinAndSelect("art_lists.artworks", "artwork")
        .where("art_lists.id = :id", { id: artlistId })
        .getOne();

        if(!list) throw new NotFoundException({message: 'No list found'});
        let artworks = this.filterArtworksByOptions(list.artworks, options)
        if (!artworks.length) throw new NotFoundException({ message: 'No artworks found' });
        artworks = await this.seen(currentUserId, artworks)
        artworks = await this.addGeo(artworks)
        return { artworks, ...this.artworkFilters(artworks) } as ArtAndFilters;
    }

    async findByUserId(userId: number) {
        let res = await this.ArtListRepository
        .createQueryBuilder('art_lists')
        .leftJoinAndSelect("art_lists.artworks", "artwork")
        .where("user_id = :id", { id: userId })
        .getMany();
        
        if(!res) throw new NotFoundException({message: 'User has no lists'});
        return res;
    }

    async create(dto: CreateArtListDTO): Promise<void> {
        //Get list data from body object
        let l = Object.assign(new ArtListEntity(), {name: dto.name, text: dto.text})
        const list = this.ArtListRepository.create(l);
        await this.ArtListRepository.save(list);
        //ArtLists can never be empty, a first artwork to store must be provided
        this.addArtworkToList(list.id, dto.artworkId);
    }

    async delete(id: number): Promise<void> {
        const list = await this.ArtListRepository
            .createQueryBuilder('art_lists')
            .where("id = :id", { id: id })
            .getOne();
        await this.ArtListRepository.delete(list as any);
    }

    async update(artlistId: number, dto: UpdateArtListDTO): Promise<void> {
        const list = await this.ArtListRepository
            .createQueryBuilder('art_lists')
            .where("id = :id", { id: artlistId })
            .getOne();
        if (!list) throw new NotFoundException({message: 'No list found'});

        //Update ArtList (Name, Text)
        let l = Object.assign(new ArtListEntity(), {name: dto.name, text: dto.text})
        await this.ArtListRepository.save(Object.assign(list, l));

        //Update ArtList contens (Artworks saved in that list)
        //First delete all artworks contained, then save the new array of artworks the list contains
        await this.ArtListRepository
            .createQueryBuilder('art_list_contains')
            .delete()
            .from('art_list_contains')
            .where("art_list_id = :id", { id: artlistId })
            .execute();
        dto.artworksIds.forEach(e => 
            this.addArtworkToList(artlistId, e)
        );
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

    async addGeo(artworks: ArtworkEntity[]) {
        const geoPromises = artworks.map(artwork =>
          this.geocoder.geocode(artwork.museum)
        );
        const geocodes = await Promise.all(geoPromises);
        return artworks.map((artwork, i) => {
          const [geocode] = geocodes[i];
          return {
            ...artwork,
            latitude: geocode?.latitude,
            longitude: geocode?.longitude,
          };
        });
    }

    //To use in CREATE
    async addArtworkToList(id: number, artworkId: number): Promise<void> {
        await this.ArtListRepository
            .createQueryBuilder()
            .insert()
            .into('art_list_contains')
            .values([
                { art_list_id: id, artwork_id: artworkId }
            ]).execute()
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
