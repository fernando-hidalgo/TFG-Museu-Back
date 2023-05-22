import { Controller, Get } from '@nestjs/common';
import { ScrappingService } from './scrapping.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('scrapping')
export class ScrappingController {
    constructor(private readonly ScrappingService: ScrappingService) {}

    //TODO: Proteger para solo ADMIN
    @Get('/thyssen')
    @ApiTags('Scrapping')
    @ApiOperation({ summary: 'Obtener datos del Museo Thyssen'})
    @ApiBearerAuth()
    async scrapThyssenMuseum(){
        return this.ScrappingService.getThyssenMuseum();
    }

    @Get('/picasso')
    @ApiTags('Scrapping')
    @ApiOperation({ summary: 'Obtener datos del Museo Picasso'})
    @ApiBearerAuth()
    async scrapPicassoMuseum(){
        return this.ScrappingService.getPicassoMuseum();
    }
}
