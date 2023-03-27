import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { RoleDecorator } from 'src/custom-decorators';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { RoleType } from 'src/role/role.enum';
import { CreateRatingDTO} from './dto/create-rating.dto';
import { UpdateRatingDTO } from './dto/update-rating.dto';
import { RatingService } from './rating.service';

@Controller('rating')
export class RatingController {
    constructor(private readonly RatingService: RatingService) {}

    @Get()
    async getAll(){
        return this.RatingService.getAll();
    }

    @Get('/:id')
    async getOne(@Param('id', ParseIntPipe) id: number) {
        return await this.RatingService.findById(id);
    }

    @Get('/artwork/:id')
    async findByArtworkId(@Param('id', ParseIntPipe) id: number) {
        return await this.RatingService.findByArtworkId(id);
    }

    //Devuelve los ratings de un usuario dado, para sacar de ahí que obras ha visto
    @Get('/user/:id')
    async findArtworkByUserId(@Param('id', ParseIntPipe) id: number) {
        return await this.RatingService.findArtworkByUserId(id);
    }

    //TODO: Descomentar cuando ya funcione el LOGIN
    //@RoleDecorator(RoleType.USER)
    //@UseGuards(JwtAuthGuard, RolesGuard)
    //@UsePipes(new ValidationPipe({whitelist: true}))
    @Post()
    async create(@Body() dto: CreateRatingDTO) {
        return await this.RatingService.create(dto);
    }

    @UsePipes(new ValidationPipe({whitelist: true}))
    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRatingDTO) {
        return await this.RatingService.update(id, dto);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number){
        return await this.RatingService.delete(id)
    }
}
