import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ArtworkService } from './artwork.service';

@Controller('artwork')
export class ArtworkController {

    constructor(private readonly ArtworkService: ArtworkService) {}

    @Get()
    async getAll(){
        return this.ArtworkService.getAll();
    }

    @Get(':id')
    async getOne(@Param('id', ParseIntPipe) id: number) {
        return await this.ArtworkService.findById(id);
    }
}
