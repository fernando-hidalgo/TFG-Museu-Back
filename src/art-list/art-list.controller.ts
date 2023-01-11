import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ArtListService } from './art-list.service';
import { ArtListDTO } from './dto/art-list.dto';
import { CreateArtListDTO } from './dto/create-art-list.dto';
import { UpdateArtListDTO } from './dto/update-art-list.dto';

@Controller('art-list')
export class ArtListController {
    constructor(private readonly ArtListService: ArtListService) {}

    @Get()
    async getAll(){
        return this.ArtListService.getAll();
    }

    @Get(':id')
    async getOne(@Param('id', ParseIntPipe) id: number) {
        return await this.ArtListService.findById(id);
    }

    @Post()
    async create(@Body() dto: CreateArtListDTO) {
        return await this.ArtListService.create(dto);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number){
        return await this.ArtListService.delete(id)
    }

    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateArtListDTO) {
        return await this.ArtListService.update(id, dto);
    }
}
