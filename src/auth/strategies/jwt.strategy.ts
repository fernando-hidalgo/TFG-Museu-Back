import { PayloadInterface } from './../payload.interface';
import { JWT_SECRET } from './../../constants';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from './../../user/user.entity';
import { AuthRepository } from './../auth.repository';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        @InjectRepository(UserEntity)
        private readonly AuthRepository: AuthRepository,
        private readonly ConfigService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: ConfigService.get(JWT_SECRET)
        });
    }

    async validate(payload: PayloadInterface) {
        const {nickname, email} = payload;
        const user = await this.AuthRepository.findOne({where: [{nickname: nickname}, {email: email}]});
        if(!user) return new UnauthorizedException({message: 'Wrong credentials'});
        return payload;
    }
}