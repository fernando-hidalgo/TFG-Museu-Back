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

@Controller('art-list')
export class ArtListController {
    constructor(private readonly ArtListService: ArtListService) {}

    @Get()
    async getAll(){
        return this.ArtListService.getAll();
    }

    @Get(':artlistId')
    async getOne(@Param('artlistId', ParseIntPipe) artlistId: number) {
        return await this.ArtListService.findById(artlistId);
    }

    @Get('details/:artlistId')
    async getOneDetailed(
        @Param('artlistId', ParseIntPipe) artlistId: number,
        @Query('currentUserId') currentUserId: number) {
        return await this.ArtListService.findByIdDetailed(artlistId, currentUserId);
    }

    @Get('filtered/:artlistId')
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
    async findByUserId(@Param('id', ParseIntPipe) userId: number) {
        return await this.ArtListService.findByUserId(userId);
    }

    @RoleDecorator(RoleType.USER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put('/edit/:id')
    async findListToEdit(
        @Param('id', ParseIntPipe) artlistId: number,
        @Body() body: any) {
        return await this.ArtListService.findListToEdit(artlistId, body);
    }

    @RoleDecorator(RoleType.USER)
    @UseGuards(JwtAuthGuard, RolesGuard, ArtlistGuard)
    @UsePipes(new ValidationPipe({whitelist: true}))
    @Put('add-list-modal/:id')
    async addToListModal(@Param('id', ParseIntPipe) artworkId: number, @Body() arlistsIds: any) {
        return await this.ArtListService.addToListModal(artworkId, arlistsIds);
    }

    @RoleDecorator(RoleType.USER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UsePipes(new ValidationPipe({whitelist: true}))
    @Post()
    async create(@Body() dto: CreateArtListDTO) {
        return await this.ArtListService.create(dto);
    }

    @RoleDecorator(RoleType.USER)
    @UseGuards(JwtAuthGuard, RolesGuard, ArtlistGuard)
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number){
        return await this.ArtListService.delete(id)
    }

    @RoleDecorator(RoleType.USER)
    @UseGuards(JwtAuthGuard, RolesGuard, ArtlistGuard)
    @UsePipes(new ValidationPipe({whitelist: true}))
    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
        return await this.ArtListService.update(id, dto);
    }

    //S3 Arlist Images
    @UsePipes(new ValidationPipe({whitelist: true}))
    @Post('cover/:id')
    @UseInterceptors(FileInterceptor('file'))
    async saveCover(
        @Param('id', ParseIntPipe) artlistId: number,
        @UploadedFile() file: Express.Multer.File) {
        return await this.ArtListService.uploadCover(artlistId, file?.buffer);
    }

    @Get('cover/:id')
    async getCover(
        @Param('id', ParseIntPipe) artlistId: number) {
        return await this.ArtListService.getCover(artlistId);
    }
}
