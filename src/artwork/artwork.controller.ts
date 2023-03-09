import { Body, Controller, Get, Param, ParseIntPipe, Req } from '@nestjs/common';
import { ArtworkService } from './artwork.service';

@Controller('artwork')
export class ArtworkController {

    constructor(private readonly ArtworkService: ArtworkService) {}

    @Get()
    async getAll(){
        return await this.ArtworkService.getAll();
    }

    @Get('/filtered')
    async getFiltered(@Body() filters) {
        return await this.ArtworkService.findFiltered(filters);
    }

    @Get('/:id')
    async getOne(@Param('id', ParseIntPipe) id: number) {
        return await this.ArtworkService.findById(id);
    }

    
}
