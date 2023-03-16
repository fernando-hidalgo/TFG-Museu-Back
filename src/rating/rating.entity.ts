import { ArtworkEntity } from "../artwork/artwork.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "src/user/user.entity";

@Entity({name: 'ratings'})
export class RatingEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', nullable: false})
    value: number;

    @Column({type: 'varchar'})
    text: string;

    @ManyToOne(type => ArtworkEntity, artwork => artwork.ratings, { onDelete:'CASCADE', nullable: false, eager: true}) 
    @JoinColumn({ name: 'artwork_id' })
    artwork: ArtworkEntity;

    @ManyToOne(type => UserEntity, user => user.ratings, { onDelete:'CASCADE', nullable: false, eager: true}) 
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;
}