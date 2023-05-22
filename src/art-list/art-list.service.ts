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
import { S3 } from 'aws-sdk';
import { UserEntity } from 'src/user/user.entity';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class ArtListService {
    NodeGeocoder = require('node-geocoder');
    options = {provider: 'openstreetmap'};
    geocoder = this.NodeGeocoder(this.options);

    constructor(
        @InjectRepository(ArtListEntity)
        private ArtListRepository: ArtListRepository,

        @InjectRepository(ArtworkEntity)
        private ArtworkRepository: ArtworkRepository,

        @InjectRepository(UserEntity)
        private UserRepository: UserRepository,
    ) {}

    async getAll(): Promise<ArtListEntity[]> {
        const res = await this.ArtListRepository.find();
        if(!res.length) throw new NotFoundException({message: 'No lists found'});
        return res;
    }

    async findById(id: number): Promise<Boolean> {
        return !!(
            await this.ArtListRepository
            .createQueryBuilder('art_lists')
            .where("art_lists.id = :id", { id })
            .getOne()
        );
    }

    async findByIdDetailed(artlistId: number, currentUserId: number): Promise<any> {
        let list = await this.ArtListRepository
        .createQueryBuilder('art_lists')
        .leftJoinAndSelect("art_lists.artworks", "artwork")
        .where("art_lists.id = :id", { id: artlistId })
        .getOne();

        const listName = list.name
        const listDescription = list.text
        
        if(!list) throw new NotFoundException({message: 'No list found'});
        let artworks = list.artworks
        artworks = await this.seen(currentUserId, artworks)
        artworks = await this.addGeo(artworks)
        return { artworks, ...this.artworkFilters(list.artworks), listName, listDescription } ;
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

        return {
            name: list.name,
            description: list.text,
            artworks: artworksInList,
            nameFilter: this.artworkFilters(artworksToSuggest)['nameFilter'],
            editListOptions: artworksToSuggest.map(artwork => ({id: artwork.id, name: artwork.name}))
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

    async create(dto: CreateArtListDTO): Promise<ArtListEntity> {
        const list = await this.ArtListRepository.save(
            this.ArtListRepository.create({
                ...dto,
                user: { id: dto.userId }
            })
        );
        return list;
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

    async addToListModal(artworkId: number, arlistsIds): Promise<void> {
        await Promise.all(arlistsIds.arlistsIds.map((e: number) => this.addArtworkToList(e, artworkId)));
    }

    async uploadCover(artlistId: number, dataBuffer: Buffer) {
        try {
            const AWSParams = {
                Bucket: 'museu-tfg',
                Body: dataBuffer || "",
                Key: `cover-${artlistId}.jpg`
            }

            const s3 = new S3();
            const uploadResult = await s3.upload(AWSParams).promise();
            return { key: uploadResult.Key };
        } catch (err) {
            console.log(err);
            return { key: 'error', message: err.message };
        }
    }

    async getCover(artlistId: number) {
        try {
            const AWSParams = {
                Bucket: 'museu-tfg',
                Key: `cover-${artlistId}.jpg`,
                Expires: 60 * 60 // Tiempo de expiración en segundos (1 hora en este ejemplo)
            }

            const s3 = new S3();
            return { url: s3.getSignedUrl('getObject', AWSParams)};
        } catch (err) {
            console.log(err);
            return { key: 'error', message: err.message };
        }

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

    async addGeo(artworks: ArtworkEntity[]): Promise<ArtworkEntity[]> {
        const uniqueMuseums = [...new Set(artworks.map((artwork) => artwork.museum))];

        const coordinates = await Promise.all(uniqueMuseums.map((museum) => this.getCoordinates(museum)));

        const artworksWithCoordinates = artworks.map((artwork) => {
            const matchingCoordinate = coordinates.find((coordinate) => coordinate?.museum === artwork.museum);
            return {
                ...artwork,
                latitude: matchingCoordinate?.latitude || artwork.latitude,
                longitude: matchingCoordinate?.longitude || artwork.longitude,
            };
        });

        return artworksWithCoordinates;
    }

    async getCoordinates(museum: string) {
        try {
            const [result] = await this.geocoder.geocode(museum);
            if (result) {
                return {
                    museum: museum,
                    latitude: result.latitude,
                    longitude: result.longitude,
                };
            }
        } catch (error) {
            console.error(`Error geocoding ${museum}: ${error}`);
        }
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

    //To use in GUARDS
    async getListOwner(id): Promise<number>{
        try {
            let artlist = await this.ArtListRepository
            .createQueryBuilder('art_lists')
            .innerJoin('art_lists.user', 'user')
            .addSelect('user.id')
            .where("art_lists.id = :id", { id })
            .getOne()

            return artlist.user.id
        }catch {}
    }
}
