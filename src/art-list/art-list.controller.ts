import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { UsePipes } from '@nestjs/common/decorators';
import { ValidationPipe } from '@nestjs/common/pipes';
import { ArtListService } from './art-list.service';
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

    @Get('/user/:id')
    async findByUserId(@Param('id', ParseIntPipe) userId: number) {
        return await this.ArtListService.findByUserId(userId);
    }

    @UsePipes(new ValidationPipe({whitelist: true}))
    @Post()
    async create(@Body() dto: CreateArtListDTO) {
        return await this.ArtListService.create(dto);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number){
        return await this.ArtListService.delete(id)
    }

    @UsePipes(new ValidationPipe({whitelist: true}))
    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateArtListDTO) {
        return await this.ArtListService.update(id, dto);
    }
}
