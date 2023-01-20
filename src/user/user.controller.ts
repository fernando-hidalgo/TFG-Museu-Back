import { CreateUserDTO } from './dto/create-user.dto';
import { UserService } from './user.service';
import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';

@Controller('user')
export class UserController {

    constructor(private readonly UserService: UserService) {}

    @Get()
    getAll() {
        return this.UserService.getAll();
    }

    @UsePipes(new ValidationPipe({whitelist: true}))
    @Post('/createAdminUser')
    createAdminUser(@Body() dto: CreateUserDTO) {
        return this.UserService.createAdminUser(dto);
    }

    @UsePipes(new ValidationPipe({whitelist: true}))
    @Post('/createRegularUser')
    createRegularUser(@Body() dto: CreateUserDTO) {
        return this.UserService.createRegularUser(dto);
    }
}