import { PayloadInterface } from './payload.interface';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { LoginUserDTO } from './dto/login.dto';
import { UserEntity } from './../user/user.entity';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleType } from 'src/role/role.enum';
import { AuthRepository } from './auth.repository';
import { TokenDTO } from './dto/token.dto';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(UserEntity)
        private readonly AuthRepository: AuthRepository,
        private readonly jwtService: JwtService
    ) {}

    async login(dto: LoginUserDTO): Promise<any> {
        const {nick_or_mail} = dto;
        const user = await this.AuthRepository.findOne({where: [{nickname: nick_or_mail}, {email: nick_or_mail}]});
        if(!user) return new UnauthorizedException({message: 'No user found'});

        const passwordOK = await compare(dto.password, user.password);
        if(!passwordOK) return new UnauthorizedException({message: 'Wrong credentials'});

        const payload: PayloadInterface = {
            id: user.id,
            nickname: user.nickname,
            email: user.email,
            roles: user.roles.map(rol => rol.type as RoleType)
        }
        
        const token = await this.jwtService.sign(payload);
        return {token};
    }

    async refresh(dto: TokenDTO): Promise<any> {
        const user = await this.jwtService.decode(dto.token);
        const payload: PayloadInterface = {
            id: user[`id`],
            nickname: user[`nickname`],
            email: user[`email`],
            roles: user[`roles`]
        }
        const token = await this.jwtService.sign(payload);
        return {token};
    }
    
}