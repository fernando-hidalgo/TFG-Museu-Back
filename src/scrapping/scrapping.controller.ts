import { Controller, Get } from '@nestjs/common';
import { ScrappingService } from './scrapping.service';

@Controller('scrapping')
export class ScrappingController {
    constructor(private readonly ScrappingService: ScrappingService) {}

    @Get()
    async scrap(){
        return this.ScrappingService.scrap();
    }

    @Get('/picasso')
    async getPicassoMuseum(){
        return this.ScrappingService.getPicassoMuseum();
    }
}
