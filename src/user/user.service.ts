import { RoleEntity } from './../role/role.entity';
import { RoleRepository } from './../role/role.repository';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import { UserEntity } from './user.entity';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleType } from 'src/role/role.enum';
import { compare } from 'bcryptjs';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(RoleEntity)
        private readonly RoleRepository: RoleRepository,
        @InjectRepository(UserEntity)
        private readonly UserRepository: UserRepository
    ) {}

    async findNicknameById(id: number): Promise<any> {
        let user = await this.UserRepository.findOne({where: [{id}]})
        return {nickname: user.nickname}
    }

    async findUserExistsById(id: number): Promise<Boolean> {
        return !!(
            await this.UserRepository.findOne({
                where: [{id}]
            })
        );
    }

    async userAvailable(nickname: string, email: string): Promise<boolean> {
        if (!nickname && !email) return false;
      
        const user = await this.UserRepository.findOne({
          where: {
            ...(nickname && { nickname }),
            ...(email && { email }),
          },
        });
      
        return !user;
    }
          

    async accountExists(nickOrMail: string, password: string): Promise<boolean> {
        if (!nickOrMail || !password) return false;
    
        const user = await this.UserRepository.findOne({
            where: [
                { nickname: nickOrMail },
                { email: nickOrMail }
            ],
        });
    
        return !!user && (await compare(password, user.password));
    }

    async createAdminUser(dto: CreateUserDTO): Promise<any> {
        const {nickname, email} = dto;
        const exists = await this.UserRepository.findOne({where: [{nickname: nickname}, {email: email}]});
        if(exists) throw new BadRequestException({message: 'User already exits'});

        const rolAdmin = await this.RoleRepository.findOne({where: {type: RoleType.ADMIN}});
        const rolUser = await this.RoleRepository.findOne({where: {type: RoleType.USER}});
        if(!rolAdmin || !rolUser) throw new InternalServerErrorException({message: 'Missing mandatory roles'});

        const admin = this.UserRepository.create(dto);
        admin.roles = [rolAdmin, rolUser];
        await this.UserRepository.save(admin);
        return "Usuario admin creado con éxito"
    }

    async createRegularUser(dto: CreateUserDTO): Promise<any> {
        const {nickname, email} = dto;
        const exists = await this.UserRepository.findOne({where: [{nickname: nickname}, {email: email}]});
        if(exists) throw new BadRequestException({message: 'User already exits'});

        const rolUser = await this.RoleRepository.findOne({where: {type: RoleType.USER}});
        if(!rolUser) throw new InternalServerErrorException({message: 'Missing mandatory roles'});

        const regular = this.UserRepository.create(dto);
        regular.roles = [rolUser];
        await this.UserRepository.save(regular);
        return "Usuario regular creado con éxito"
    }
}
