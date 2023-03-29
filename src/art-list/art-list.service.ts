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

@Injectable()
export class ArtListService {
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

    async findById(artlistId: number, userId?: number): Promise<ArtAndFilters> {
        let list = await this.ArtListRepository
        .createQueryBuilder('art_lists')
        .innerJoinAndSelect("art_lists.artworks", "artwork")
        .where("art_lists.id = :id", { id: artlistId })
        .getOne();
        if(!list) throw new NotFoundException({message: 'No list found'});
        let artworks = list.artworks
        if(userId) artworks = await this.seen(userId, artworks)
        return { artworks, ...this.artworkFilters(list.artworks) } as ArtAndFilters ;
    }

    async findFilteredInList(artlistId: number, userId?: number){

    }

    async findByUserId(userId: number) {
        let res = await this.ArtListRepository
        .createQueryBuilder('art_lists')
        .innerJoinAndSelect("art_lists.artworks", "artwork")
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

    async update(id: number, dto: UpdateArtListDTO): Promise<void> {
        const list = await this.ArtListRepository
            .createQueryBuilder('art_lists')
            .where("id = :id", { id: id })
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
            .where("artListsId = :id", { id: id })
            .execute();
        dto.artworksIds.forEach(e => 
            this.addArtworkToList(id, e)
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

    //To use in CREATE
    async addArtworkToList(id: number, artworkId: number): Promise<void> {
        await this.ArtListRepository
            .createQueryBuilder()
            .insert()
            .into('art_list_contains')
            .values([
                { artListsId: id, artworksId: artworkId }
            ]).execute()
    }

    //Inutil, eliminar al final si no se usa nunca
    async deleteArtworksFromList(id: number, artworksIds: number[]): Promise<void> {
        await this.ArtListRepository.query(`DELETE FROM art_list_contains WHERE artListsId = ? AND artworksId IN (?);`, [id, artworksIds]);
    }
}
