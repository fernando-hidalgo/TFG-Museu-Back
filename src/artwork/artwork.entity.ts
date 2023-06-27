import { RatingEntity } from "../rating/rating.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'artworks'})
export class ArtworkEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'longtext'})
    picLink: string;

    @Column({type: 'longtext', nullable: false})
    name: string;

    @Column({type: 'longtext'})
    artist: string;

    @Column({type: 'longtext'})
    style: string;

    @Column({type: 'longtext'})
    date: string;

    @Column({type: 'longtext'})
    description: string;

    @Column({type: 'longtext', nullable: false})
    museum: string;

    @Column({type: 'longtext'})
    colection: string;

    @Column({ type: 'boolean' })
    display: boolean;

    @Column({type: 'longtext'})
    room: string;

    @Column({type: "float"})
    averageRating: number;

    @OneToMany(type => RatingEntity, rating => rating.artwork)
    ratings: RatingEntity[];

    //No deben ser columnas en BD
    seen: boolean;
    userRating: number;
    latitude: number;
    longitude: number;
}