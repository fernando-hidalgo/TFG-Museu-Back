import { ArtworkEntity } from "src/artwork/artwork.entity";
import { UserEntity } from "src/user/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'art_lists'})
export class ArtListEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'longtext', nullable: false})
    name: string;

    @Column({type: 'longtext'})
    text: string;

    @ManyToOne(type => UserEntity, user => user.ratings, { onDelete:'CASCADE', nullable: false, eager: true}) 
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @ManyToMany(type => ArtworkEntity, { nullable: true, eager: true })
    @JoinTable({
        name: 'art_list_contains',
        joinColumn: {name: 'art_list_id'},
        inverseJoinColumn: {name: 'artwork_id'}
    }) 
    artworks: ArtworkEntity[];
}