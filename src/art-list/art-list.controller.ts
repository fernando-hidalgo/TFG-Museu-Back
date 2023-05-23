import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { Query, UploadedFile, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common/decorators';
import { ValidationPipe } from '@nestjs/common/pipes';
import { ArtListService } from './art-list.service';
import { CreateArtListDTO } from './dto/create-art-list.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RoleDecorator } from 'src/custom-decorators';
import { RoleType } from 'src/role/role.enum';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { ArtlistGuard } from 'src/guards/artlist.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResourceOwnerGuard } from 'src/guards/resource-owner.guard';
import { UpdateArtListDTO } from './dto/update-art-list.dto';

@Controller('art-list')
export class ArtListController {
    constructor(private readonly ArtListService: ArtListService) {}

    @Get(':artlistId')
    @ApiTags('Artlist')
    @ApiOperation({ summary: 'Obtener una lista dado un ID'})
    async getOne(@Param('artlistId', ParseIntPipe) artlistId: number) {
        return await this.ArtListService.findById(artlistId);
    }

    @Get('details/:artlistId')
    @ApiParam({ name: 'currentUserId', required: false })
    @ApiTags('Artlist')
    @ApiOperation({ summary: 'Obtener las obras contenidas en una lista dado un ID'})
    async getOneDetailed(
        @Param('artlistId', ParseIntPipe) artlistId: number,
        @Query('currentUserId') currentUserId: number) {
        return await this.ArtListService.findByIdDetailed(artlistId, currentUserId);
    }

    @Get('filtered/:artlistId')
    @ApiTags('Artlist')
    @ApiOperation({ summary: 'Filtrar las obras contenidas en una lista dado un ID'})
    @ApiParam({ name: 'nameFilter', required: false })
    @ApiParam({ name: 'artistFilter', required: false })
    @ApiParam({ name: 'styleFilter', required: false })
    @ApiParam({ name: 'museumFilter', required: false })
    @ApiParam({ name: 'currentUserId', required: false })
    async getFiltered(
        @Param('artlistId', ParseIntPipe) artlistId: number,
        @Query('nameFilter') nameFilter: string,
        @Query('artistFilter') artistFilter: string,
        @Query('styleFilter') styleFilter: string,
        @Query('museumFilter') museumFilter: string,
        @Query('currentUserId') currentUserId: number) {
        return await this.ArtListService.findFilteredInList(artlistId, nameFilter, artistFilter, styleFilter, museumFilter, currentUserId);
    }

    @Get('/user/:id')
    @ApiTags('Artlist')
    @ApiOperation({ summary: 'Obtener todas las listas de un usuario dado un ID'})
    async findByUserId(@Param('id', ParseIntPipe) userId: number) {
        return await this.ArtListService.findByUserId(userId);
    }

    @RoleDecorator(RoleType.USER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put('/edit/:id')
    @ApiTags('Artlist')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener lista para ser editada dado un ID'})
    async findListToEdit(
        @Param('id', ParseIntPipe) artlistId: number,
        @Body() body: any) {
        return await this.ArtListService.findListToEdit(artlistId, body);
    }

    @RoleDecorator(RoleType.USER)
    @UseGuards(JwtAuthGuard, RolesGuard, ArtlistGuard)
    @UsePipes(new ValidationPipe({whitelist: true}))
    @Put('modal/:id')
    @ApiTags('Artlist')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Añadir obras a una lista a través del modal, dado artworkId y arlistsIds'})
    async addToListModal(@Param('id', ParseIntPipe) artworkId: number, @Body() arlistsIds: any) {
        return await this.ArtListService.addToListModal(artworkId, arlistsIds);
    }

    @RoleDecorator(RoleType.USER)
    @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
    @UsePipes(new ValidationPipe({whitelist: true}))
    @Post()
    @ApiTags('Artlist')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Crear una lista'})
    async create(@Body() dto: CreateArtListDTO) {
        return await this.ArtListService.create(dto);
    }

    @RoleDecorator(RoleType.USER)
    @UseGuards(JwtAuthGuard, RolesGuard, ArtlistGuard)
    @Delete(':id')
    @ApiTags('Artlist')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Eliminar una lista'})
    async delete(@Param('id', ParseIntPipe) id: number){
        return await this.ArtListService.delete(id)
    }

    @RoleDecorator(RoleType.USER)
    @UseGuards(JwtAuthGuard, RolesGuard, ArtlistGuard)
    @UsePipes(new ValidationPipe({whitelist: true}))
    @Put(':id')
    @ApiTags('Artlist')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Modificar una lista'})
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateArtListDTO) {
        return await this.ArtListService.update(id, dto);
    }

    //S3 Arlist Images
    @UsePipes(new ValidationPipe({whitelist: true}))
    @Post('cover/:id')
    @ApiTags('Artlist')
    @ApiOperation({ summary: 'Añadir una portada a una lista'})
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('file'))
    async saveCover(
        @Param('id', ParseIntPipe) artlistId: number,
        @UploadedFile() file: Express.Multer.File) {
        return await this.ArtListService.uploadCover(artlistId, file?.buffer);
    }

    @Get('cover/:id')
    @ApiTags('Artlist')
    @ApiOperation({ summary: 'Obtener la portada de una lista'})
    async getCover(
        @Param('id', ParseIntPipe) artlistId: number) {
        return await this.ArtListService.getCover(artlistId);
    }
}
