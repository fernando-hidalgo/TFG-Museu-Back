import { Controller, Get } from '@nestjs/common';
import { ScrappingService } from './scrapping.service';

@Controller('scrapping')
export class ScrappingController {
    constructor(private readonly ScrappingService: ScrappingService) {}

    //TODO: Proteger para solo ADMIN
    @Get('/thyssen')
    async scrapThyssenMuseum(){
        return this.ScrappingService.getThyssenMuseum();
    }

    @Get('/picasso')
    async scrapPicassoMuseum(){
        return this.ScrappingService.getPicassoMuseum();
    }
}
