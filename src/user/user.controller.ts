import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserService } from './user.service';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';

@Controller('user')
export class UserController {

    constructor(private readonly UserService: UserService) {}

    @Get('/available')
    @ApiTags('User')
    @ApiOperation({ summary: 'Comprobar si existe un usuario dado nickname y/o mail'})
    async userAvailable(
        @Query('nickname') nickname: string,
        @Query('email') email: string,) {
        return await this.UserService.userAvailable(nickname, email);
    }

    @Get('/acount-exists')
    @ApiTags('User')
    @ApiOperation({ summary: 'Comprobar si existe un usuario dados unos credenciales'})
    async findAccountExists(
        @Query('nick_or_mail') nick_or_mail: string,
        @Query('password') password: string,) {
        return await this.UserService.getAccountExists(nick_or_mail, password);
    }

    @Get('nickname/:id')
    @ApiTags('User')
    @ApiOperation({ summary: 'Obtener el nickname de un usuario dado un id'})
    getNickname(@Param('id', ParseIntPipe) id: number) {
        return this.UserService.findNicknameById(id);
    }

    @Get(':id')
    @ApiTags('User')
    @ApiOperation({ summary: 'Comprobar si existe un usuario dado un ID'})
    getOne(@Param('id', ParseIntPipe) id: number) {
        return this.UserService.findUserExistsById(id);
    }

    @UsePipes(new ValidationPipe({whitelist: true}))
    @Post('/create-admin-user')
    @ApiTags('User')
    @ApiOperation({ summary: 'Crear usuario administrador'})
    @ApiBearerAuth()
    createAdminUser(@Body() dto: CreateUserDTO) {
        return this.UserService.createAdminUser(dto);
    }

    @UsePipes(new ValidationPipe({whitelist: true}))
    @Post('/create-regular-user')
    @ApiTags('User')
    @ApiOperation({ summary: 'Crear usuario'})
    @ApiBearerAuth()
    createRegularUser(@Body() dto: CreateUserDTO) {
        return this.UserService.createRegularUser(dto);
    }
}