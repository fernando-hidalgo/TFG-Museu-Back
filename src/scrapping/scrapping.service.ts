import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArtworkEntity } from 'src/artwork/artwork.entity';
import { ArtworkRepository } from '../artwork/artwork.repository';
import { ArtworkDTO } from 'src/artwork/dto/artwork.dto';
import puppeteer from 'puppeteer';
import { Cluster } from 'puppeteer-cluster';
var objectHash = require('object-hash');

@Injectable()
export class ScrappingService {
    constructor(
        @InjectRepository(ArtworkEntity)
        private ArtworkRepository: ArtworkRepository
    ) {}

    //Método A: Scrapping HTML
    async getThyssenMuseum() {
        //Primera Parte: Obtener las URLs de Detalles de cada obra
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        //La estructura de la URL espera el número de página
        const museumURL = "https://www.museothyssen.org/buscador/artista/14572/artista/14619/artista/14728/artista/14813/coleccion/41/tipo/obra?page=";
        const artCMS = "https://www.museothyssen.org/sites/default/files/styles/full_resolution/public/imagen/obras/"
        let pageURLNumber = 0;
        let detailsURLs = [];

        //Se navega por cada página del catálogo, obteniendo la URL a los Detalles de la obra
        while (true) {
            const url = `${museumURL}${pageURLNumber}`;
            await page.goto(url);
        
            const catalogGrid = await page.$$('.row .row--abajo > div');
        
            if (!catalogGrid.length) break;
        
            for (const artCard of catalogGrid) {
                const detailsLink = await artCard.evaluate(el => el.querySelector("div > a")?.getAttribute('href'));
                if (detailsLink) detailsURLs.push(detailsLink);
            }
        
            pageURLNumber++;
        }

        //Segunda Parte: Mediante un cluster, acceder en paralelo a cada Detalle y recopilar datos
        const cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_PAGE,
            maxConcurrency: detailsURLs?.length / 2, //La mitad del total de obras
        });

        cluster.on("taskerror", (err, data) => {
            console.log(`Error crawling ${data}: ${err.message}`);
        });

        let ArtworksToSave = []
        //Se accede a los detalles de cada obra y se obtienen sus datos
        await cluster.task(async ({ page, data: url }) => {
            await page.goto(url)

            const [artist, infoBlock] = await Promise.all([
                page.$eval('#rs_artwork_artist', el => el.textContent.trim()),
                page.$('.is-hidden.js-zoom-map-info')
            ])

            let description: string;
            try {
                description = await page.$eval('#rs_artwork_description > div > div > p', el => el.innerHTML)
            } catch (error) {
                description = await page.$eval('#rs_artwork_description > div > div', el => el.innerHTML)
            }

            const [name, date, subInfoBlock] = await Promise.all([
                infoBlock.evaluate(el => el.querySelector("div > h1.h3")?.textContent.trim()),
                infoBlock.evaluate(el => el.querySelector("div > div > div.h6")?.textContent.trim().split(' - ')[0]),
                infoBlock.$$("div > div > div.u-grid.u-font-size-sm > div")
            ])

            const [style, inventoryId, room] = await Promise.all([
                subInfoBlock[0].evaluate(el => el.textContent.trim().split(/[ ,]+/)[0]),
                subInfoBlock[2].evaluate(el => el.textContent.trim().match(/\((.*?)\)/)[1]),
                subInfoBlock[3].evaluate(el => el.textContent.trim())
            ])

            const inDisplay = room.includes('Not on display') || room.includes('No Expuesta') ? false : true;
            const nameId = url.split('/').pop();
            const picLink = `${artCMS}${inventoryId}_${nameId}.jpg`

            const newArtworkDTO = {
                picLink: picLink,
                artist: artist,
                name: name,
                style: style,
                date: date,
                description: description,
                museum: "Thyssen-Bornemisza",
                colection: "Permanente",
                display: inDisplay,
                room: room
            }

            ArtworksToSave.push(newArtworkDTO)
        });

        for (const url of detailsURLs) {
            await cluster.queue(url);
        }

        await cluster.idle();
        await cluster.close();
        await browser.close();

        //Tercera Parte: Se guardan las obras
        await Promise.all(ArtworksToSave.map(art => this.saveScrap(art)));

        return "Museo Tyssen guardado";
    }


    //Método B: Uso la respuesta del GET para crear una API
    async getPicassoMuseum() {
        //Obtener el JSON con todo el catálogo
        const ApiURL = "https://www.museopicassomalaga.org/cms"
        const response = await fetch(`${ApiURL}/works`, { method: "Get" });
        const j = await response.json();

        let ArtworksToSave = []
        const keys = Object.keys(j);
        for (const key of keys) {
            const json = j[key];

            //Se crea un DTO con los campos de Artwork en BD
            const date = json.date_of_completion.split('-')[0]
            const artist = "Pablo Picasso"
            const noData = "-"
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
                museum: "Picasso Málaga",
                colection: exhibition?.title.trimStart() || noData,
                display: inDisplay,
                room: noData
            }

            ArtworksToSave.push(newArtworkDTO)
        }

        await Promise.all(ArtworksToSave.map(art => this.saveScrap(art)));

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

    async saveScrap(newArtworkDTO){
        const alreadyExists = await this.ArtworkRepository.findOne({
            where: {
                name: newArtworkDTO.name,
                artist: newArtworkDTO.artist,
                date: newArtworkDTO.date
            }
        })

        if (alreadyExists) {
            //Si ya existe, se comprueba si existen cambios. De ser así, se updatea
            const artworkToUpdate = await this.findById(alreadyExists.id);
            newArtworkDTO['id'] = alreadyExists.id
            newArtworkDTO['averageRating'] = alreadyExists.averageRating

            if (objectHash({ ...artworkToUpdate }) != objectHash(newArtworkDTO)) {
                await this.ArtworkRepository.save(Object.assign(artworkToUpdate, newArtworkDTO));
            }

        } else {
            //Si no existe, se crea uno nuevo
            newArtworkDTO['averageRating'] = 0
            const newArtwork = this.ArtworkRepository.create(newArtworkDTO)
            await this.ArtworkRepository.save(newArtwork);
        }
    }
}
