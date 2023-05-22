import { Controller, Get } from '@nestjs/common';
import { ScrapingService } from './scraping.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('scraping')
export class ScrapingController {
    constructor(private readonly ScrapingService: ScrapingService) {}

    //TODO: Proteger para solo ADMIN
    @Get('/thyssen')
    @ApiTags('Scraping')
    @ApiOperation({ summary: 'Obtener datos del Museo Thyssen'})
    @ApiBearerAuth()
    async scrapThyssenMuseum(){
        return this.ScrapingService.getThyssenMuseum();
    }

    @Get('/picasso')
    @ApiTags('Scraping')
    @ApiOperation({ summary: 'Obtener datos del Museo Picasso'})
    @ApiBearerAuth()
    async scrapPicassoMuseum(){
        return this.ScrapingService.getPicassoMuseum();
    }
}
