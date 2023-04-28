import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArtworkEntity } from 'src/artwork/artwork.entity';
import { ArtworkRepository } from '../artwork/artwork.repository';
import { ArtworkDTO } from 'src/artwork/dto/artwork.dto';
var objectHash = require('object-hash');

@Injectable()
export class ScrappingService {
    constructor(
        @InjectRepository(ArtworkEntity)
        private ArtworkRepository: ArtworkRepository
    ) {}

    //Método A: Scrapping Web
    async scrap(){

    }


    //Método B: Uso la respuesta del GET para crear una API
    async getPicassoMuseum() {
        //Obtener el JSON con todo el catálogo
        const ApiURL = "https://www.museopicassomalaga.org/cms"
        const response = await fetch(`${ApiURL}/works`, { method: "Get" });
        const j = await response.json();

        const keys = Object.keys(j);
        for (const key of keys) {
            const json = j[key];

            //Se crea un DTO con los campos de Artwork en BD
            const date = json.date_of_completion.split('-')[0]
            const artist = "Pablo Picasso"
            const noData = "Sin Datos"
            const exhibition = json.showcased_at_exhibition[0]
            
            const showcaseStartDate = new Date(exhibition?.start_date || 0)
            const showcaseEndDate = new Date(exhibition?.end_date || 0)
            const currentDate = new Date()
            let inDisplay = (currentDate > showcaseStartDate && currentDate < showcaseEndDate)

            const newArtworkDTO = {
                picLink: `${ApiURL}${json.image.url}`,
                artist: artist,
                name: json.title,
                style: json.technique.split(/[ ,]+/)[0],
                date: date,
                description: json.description === ' ' || json.description === '.' ? noData : json.description.replace(/\n/g, "<br>"),
                museum: "Museo Picasso Málaga",
                colection: exhibition?.title.trimStart() || noData,
                display: inDisplay,
                room: "",
                averageRating: 0
            }

            //Comprobar si existe ya esa obra (Nombre+Autor+Año)
            const alreadyExists = await this.ArtworkRepository.findOne({
                where: {
                    name: json.title,
                    artist: artist,
                    date: date
                }
            })

            if (alreadyExists) {
                //Si ya existe, se comprueba si existen cambios. De ser así, se updatea
                const artworkToUpdate = await this.findById(alreadyExists.id);
                newArtworkDTO['id'] = alreadyExists.id

                if (objectHash({ ...artworkToUpdate }) != objectHash(newArtworkDTO)) {
                    await this.ArtworkRepository.save(Object.assign(artworkToUpdate, newArtworkDTO));
                }

            } else {
                //Si no existe, se crea uno nuevo
                const newArtwork = this.ArtworkRepository.create(newArtworkDTO)
                await this.ArtworkRepository.save(newArtwork);
            }
        }

        return "Museo Picasso guardado"
    }

    /*HELPERS*/

    async findById(id: number): Promise<ArtworkEntity> {
        const res = await this.ArtworkRepository.findOne({ where: { id } });
        //if (!res) throw new NotFoundException({ message: 'No artwork found' });
        return res;
    }

    async createArtwork(dto: ArtworkDTO): Promise<ArtworkEntity> {
        const artwork = this.ArtworkRepository.create(dto);
        await this.ArtworkRepository.save(artwork);
        return artwork
    }

    async delete(id: number): Promise<ArtworkEntity> {
        const artwork = await this.findById(id);
        if (!artwork) throw new NotFoundException({ message: 'No artwork found' });
        await this.ArtworkRepository.delete(artwork as any);
        return artwork
    }

    async update(id: number, dto: ArtworkDTO): Promise<ArtworkEntity> {
        const artwork = await this.findById(id);
        if (!artwork) throw new NotFoundException({ message: 'No artwork found' });
        await this.ArtworkRepository.save(Object.assign(artwork, dto));
        return artwork
    }
}
