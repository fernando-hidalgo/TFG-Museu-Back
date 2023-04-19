import { CreateUserDTO } from './dto/create-user.dto';
import { UserService } from './user.service';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';

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

    @Get('/acount-exists')
    async findAccountExists(
        @Query('nick_or_mail') nick_or_mail: string,
        @Query('password') password: string,) {
        return await this.UserService.getAccountExists(nick_or_mail, password);
    }

    @Get(':id')
    getOne(@Param('id', ParseIntPipe) id: number) {
        return this.UserService.findById(id);
    }

    @UsePipes(new ValidationPipe({whitelist: true}))
    @Post('/createAdminUser')
    createAdminUser(@Body() dto: CreateUserDTO) {
        return this.UserService.createAdminUser(dto);
    }

    @UsePipes(new ValidationPipe({whitelist: true}))
    @Post('/create-regular-user')
    createRegularUser(@Body() dto: CreateUserDTO) {
        return this.UserService.createRegularUser(dto);
    }
}