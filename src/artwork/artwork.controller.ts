import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ArtworkService } from './artwork.service';
import { ArtworkDTO } from './dto/artwork.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@Controller('artwork')
export class ArtworkController {

    constructor(private readonly ArtworkService: ArtworkService) {}

    @Get()
    @ApiTags('Artworks')
    @ApiParam({ name: 'currentUserId', required: false })
    @ApiOperation({ summary: 'Obtener todas las obras'})
    async getAll(@Query('currentUserId') currentUserId: number){
        return await this.ArtworkService.getAll(currentUserId);
    }

    @Get('/filtered')
    @ApiTags('Artworks')
    @ApiParam({ name: 'nameFilter', required: false })
    @ApiParam({ name: 'artistFilter', required: false })
    @ApiParam({ name: 'styleFilter', required: false })
    @ApiParam({ name: 'museumFilter', required: false })
    @ApiParam({ name: 'currentUserId', required: false })
    @ApiOperation({ summary: 'Obtener obras según los filtros establecidos'})
    async getFiltered(
        @Query('nameFilter') nameFilter: string,
        @Query('artistFilter') artistFilter: string,
        @Query('styleFilter') styleFilter: string,
        @Query('museumFilter') museumFilter: string,
        @Query('currentUserId') currentUserId: number) {
        return await this.ArtworkService.findFiltered(nameFilter, artistFilter, styleFilter, museumFilter, currentUserId);
    }

    @Get('/:id')
    @ApiTags('Artworks')
    @ApiOperation({ summary: 'Obtener obra dado un ID'})
    async getOne(@Param('id', ParseIntPipe) id: number) {
        return await this.ArtworkService.findById(id);
    }
        
    //TODO: Proteger despues de implementar Scraping
    @Post()
    @ApiTags('Artworks')
    @ApiOperation({ summary: 'Crear obra de arte'})
    @ApiBearerAuth()
    async create(@Body() dto: ArtworkDTO) {
        return await this.ArtworkService.create(dto);
    }

    @UsePipes(new ValidationPipe({whitelist: true}))
    @Put(':id')
    @ApiTags('Artworks')
    @ApiOperation({ summary: 'Actualizar obra de arte'})
    @ApiBearerAuth()
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: ArtworkDTO) {
        return await this.ArtworkService.update(id, dto);
    }

    @Delete(':id')
    @ApiTags('Artworks')
    @ApiOperation({ summary: 'Eliminar obra de arte'})
    @ApiBearerAuth()
    async delete(@Param('id', ParseIntPipe) id: number){
        return await this.ArtworkService.delete(id)
    }
    
}