import { ArtworkEntity } from "src/artwork/artwork.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'art_lists'})
export class ArtListEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', nullable: false})
    name: number;

    @Column({type: 'varchar'})
    text: string;

    @ManyToMany(type => ArtworkEntity, { eager: true })
    @JoinTable({name: 'art_list_contains'}) 
    artworks: ArtworkEntity[];
}