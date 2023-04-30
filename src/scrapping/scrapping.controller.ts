import { Controller, Get } from '@nestjs/common';
import { ScrappingService } from './scrapping.service';

@Controller('scrapping')
export class ScrappingController {
    constructor(private readonly ScrappingService: ScrappingService) {}

    //TODO: Proteger para solo ADMIN
    @Get('/tyssen')
    async scrapTyssenMuseum(){
        return this.ScrappingService.getTyssenMuseum();
    }

    @Get('/picasso')
    async scrapPicassoMuseum(){
        return this.ScrappingService.getPicassoMuseum();
    }
}
