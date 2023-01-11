import { ArtworkEntity } from "../artwork/artwork.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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
    
}