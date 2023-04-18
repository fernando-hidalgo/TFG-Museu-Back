import { CreateUserDTO } from './dto/create-user.dto';
import { UserService } from './user.service';
import { Body, Controller, Get, Param, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';

@Controller('user')
export class UserController {

    constructor(private readonly UserService: UserService) {}

    @Get()
    getAll() {
        return this.UserService.getAll();
    }

    @Get('/fields')
    async findByFields(
        @Query('nickname') nickname: string,
        @Query('email') email: string,) {
        return await this.UserService.getUserByFields(nickname, email);
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