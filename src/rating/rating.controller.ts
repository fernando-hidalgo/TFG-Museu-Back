import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { RoleDecorator } from 'src/custom-decorators';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { RoleType } from 'src/role/role.enum';
import { CreateRatingDTO} from './dto/create-rating.dto';
import { UpdateRatingDTO } from './dto/update-rating.dto';
import { RatingService } from './rating.service';
import { RatingGuard } from 'src/guards/rating.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@Controller('rating')
export class RatingController {
    constructor(private readonly RatingService: RatingService) {}

    @Get()
    @ApiTags('Rating')
    @ApiOperation({ summary: 'Obtener todas las valoraciones'})
    async getAll(){
        return this.RatingService.getAll();
    }

    @Get('/:id')
    @ApiTags('Rating')
    @ApiOperation({ summary: 'Obtener uan valoración dado un ID'})
    async getOne(@Param('id', ParseIntPipe) id: number) {
        return await this.RatingService.findById(id);
    }

    @Get('/artwork/:id')
    @ApiTags('Rating')
    @ApiOperation({ summary: 'Obtener la valoración de una obra, dado un ID'})
    async findByArtworkId(@Param('id', ParseIntPipe) id: number) {
        return await this.RatingService.findByArtworkId(id);
    }

    @Get('/user/:id')
    @ApiTags('Artwork')
    @ApiOperation({ summary: 'Obtener obras valoradas por un usuario, dado profileId y currentUserId'})
    async findArtworkRatedByUser(
        @Param('id', ParseIntPipe) profileId: number,
        @Query('currentUserId') currentUserId: number) {
        return await this.RatingService.findArtworkRatedByUser(profileId, currentUserId);
    }

    @Get('/filtered/user/:id')
    @ApiTags('Artwork')
    @ApiOperation({ summary: 'Filtrar obras valoradas por un usuario'})
    @ApiParam({ name: 'nameFilter', required: false })
    @ApiParam({ name: 'artistFilter', required: false })
    @ApiParam({ name: 'styleFilter', required: false })
    @ApiParam({ name: 'museumFilter', required: false })
    @ApiParam({ name: 'currentUserId', required: false })
    async findFilteredArtworkRatedByUser(
        @Query('nameFilter') nameFilter: string,
        @Query('artistFilter') artistFilter: string,
        @Query('styleFilter') styleFilter: string,
        @Query('museumFilter') museumFilter: string,
        @Param('id', ParseIntPipe) profileId: number,
        @Query('currentUserId') currentUserId: number) {
        return await this.RatingService.findFilteredArtworkRatedByUser(nameFilter, artistFilter, styleFilter, museumFilter, profileId, currentUserId);
    }

    @RoleDecorator(RoleType.USER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UsePipes(new ValidationPipe({whitelist: true}))
    @Post()
    @ApiTags('Rating')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Crear valoración'})
    async create(@Body() dto: CreateRatingDTO) {
        return await this.RatingService.create(dto);
    }

    @RoleDecorator(RoleType.USER)
    @UseGuards(JwtAuthGuard, RolesGuard, RatingGuard)
    @UsePipes(new ValidationPipe({whitelist: true}))
    @Put(':id')
    @ApiTags('Rating')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Modificar valoración'})
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRatingDTO) {
        return await this.RatingService.update(id, dto);
    }
    
    @RoleDecorator(RoleType.USER)
    @UseGuards(JwtAuthGuard, RolesGuard, RatingGuard)
    @Delete(':id')
    @ApiTags('Rating')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Eliminar valoración'})
    async delete(@Param('id', ParseIntPipe) id: number){
        return await this.RatingService.delete(id)
    }
}
