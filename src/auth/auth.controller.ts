import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly AuthService: AuthService) {}

    @UsePipes(new ValidationPipe({whitelist: true}))
    @Post('login')
    login(@Body() dto: LoginUserDTO) {
        return this.AuthService.login(dto);
    }
}
