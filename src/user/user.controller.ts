import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserService } from './user.service';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {

    constructor(private readonly UserService: UserService) {}

    @Get('/available')
    @ApiTags('User')
    @ApiOperation({ summary: 'Comprobar si existe un usuario dado nickname y/o mail'})
    async checkUserAvailable(
        @Query('nickname') nickname: string,
        @Query('email') email: string,) {
        return await this.UserService.userAvailable(nickname, email);
    }

    @Get('/acount-exists')
    @ApiTags('User')
    @ApiOperation({ summary: 'Comprobar si existe un usuario dados unos credenciales'})
    async checkAccountExists(
        @Query('nick_or_mail') nick_or_mail: string,
        @Query('password') password: string,) {
        return await this.UserService.accountExists(nick_or_mail, password);
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

    //Firebase Bucket
    @UsePipes(new ValidationPipe({whitelist: true}))
    @Post('profile/:id')
    @ApiTags('User')
    @ApiOperation({ summary: 'Añadir una portada a una lista'})
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('file'))
    async saveProfilePic(
        @Param('id', ParseIntPipe) userId: number,
        @UploadedFile() file: Express.Multer.File) {
        return await this.UserService.uploadProfilePic(userId, file?.buffer);
    }

    @Get('profile/:id')
    @ApiTags('User')
    @ApiOperation({ summary: 'Obtener la portada de una lista'})
    async getProfilePic(
        @Param('id', ParseIntPipe) userId: number) {
        return await this.UserService.getProfilePic(userId);
    }
}