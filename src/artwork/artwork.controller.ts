import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ArtworkService } from './artwork.service';

@Controller('artwork')
export class ArtworkController {

    constructor(private readonly ArtworkService: ArtworkService) {}

    @Get()
    async getAll(){
        return await this.ArtworkService.getAll();
    }

    @Get('/filtered')
    async getFiltered(
        @Query('nameFilter') nameFilter: string,
        @Query('artistFilter') artistFilter: string,
        @Query('styleFilter') styleFilter: string,
        @Query('museumFilter') museumFilter: string,) {
        return await this.ArtworkService.findFiltered(nameFilter, artistFilter, styleFilter, museumFilter);
    }

    @Get('/:id')
    async getOne(@Param('id', ParseIntPipe) id: number) {
        return await this.ArtworkService.findById(id);
    }

    
}
