import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './dto/login.dto';
import { TokenDTO } from './dto/token.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
    constructor(private readonly AuthService: AuthService) {}

    @UsePipes(new ValidationPipe({whitelist: true}))
    @Post('login')
    @ApiTags('Auth')
    @ApiOperation({ summary: 'Login'})
    login(@Body() dto: LoginUserDTO) {
        return this.AuthService.login(dto);
    }

    @Post('refresh')
    @ApiTags('Auth')
    @ApiOperation({ summary: 'Refrescar JWT'})
    refresh(@Body() dto: TokenDTO) {
        return this.AuthService.refresh(dto);
    }
}
