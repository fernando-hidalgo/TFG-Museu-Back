import { RatingEntity } from "../rating/rating.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Max, Min } from "class-validator";

@Entity({name: 'artworks'})
export class ArtworkEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar'})
    picLink: string;

    @Column({type: 'varchar', nullable: false})
    name: string;

    @Column({type: 'varchar'})
    artist: string;

    @Column({type: 'varchar'})
    date: string;

    @Column({type: 'varchar'})
    description: string;

    @Column({type: 'varchar', nullable: false})
    museum: string;

    @Column({type: 'varchar'})
    colection: string;

    @Column({ type: 'boolean' })
    display: boolean;

    @Column({type: 'varchar'})
    room: string;

    @Column({type: "float"})
    averageRating: number;

    @OneToMany(type => RatingEntity, rating => rating.artwork)
    ratings: RatingEntity[];
}