import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ArtworkService } from './artwork.service';
import { ArtworkDTO } from './dto/artwork.dto';

@Controller('artwork')
export class ArtworkController {

    constructor(private readonly ArtworkService: ArtworkService) {}

    @Get()
    async getAll(@Query('currentUserId') currentUserId: number){
        return await this.ArtworkService.getAll(currentUserId);
    }

    @Get('/filtered')
    async getFiltered(
        @Query('nameFilter') nameFilter: string,
        @Query('artistFilter') artistFilter: string,
        @Query('styleFilter') styleFilter: string,
        @Query('museumFilter') museumFilter: string,
        @Query('currentUserId') currentUserId: number) {
        return await this.ArtworkService.findFiltered(nameFilter, artistFilter, styleFilter, museumFilter, currentUserId);
    }

    @Get('/:id')
    async getOne(@Param('id', ParseIntPipe) id: number) {
        return await this.ArtworkService.findById(id);
    }

    @Post()
    async create(@Body() dto: ArtworkDTO) {
        return await this.ArtworkService.create(dto);
    }

    @UsePipes(new ValidationPipe({whitelist: true}))
    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: ArtworkDTO) {
        return await this.ArtworkService.update(id, dto);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number){
        return await this.ArtworkService.delete(id)
    }

    
}
