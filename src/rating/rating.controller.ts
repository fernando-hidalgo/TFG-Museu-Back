import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { RatingDTO } from './dto/rating.dto';
import { RatingService } from './rating.service';

@Controller('rating')
export class RatingController {
    constructor(private readonly RatingService: RatingService) {}

    @Get()
    async getAll(){
        return this.RatingService.getAll();
    }

    @Get(':id')
    async getOne(@Param('id', ParseIntPipe) id: number) {
        return await this.RatingService.findByArtworkId(id);
    }

    @Post()
    async create(@Body() dto: RatingDTO) {
        return await this.RatingService.create(dto);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number){
        return await this.RatingService.delete(id)
    }

    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: RatingDTO) {
        return await this.RatingService.update(id, dto);
    }
}
