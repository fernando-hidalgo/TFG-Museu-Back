import { RoleEntity } from './../role/role.entity';
import { RoleRepository } from './../role/role.repository';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import { UserEntity } from './user.entity';
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleType } from 'src/role/role.enum';
import { compare } from 'bcryptjs';
import { initializeApp } from 'firebase/app';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { firebaseConfig } from 'src/firebase.config';

@Injectable()
export class UserService {
    private logger = new Logger('User');

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

    async uploadProfilePic(userId: number, dataBuffer: Buffer) {
        const app = initializeApp(firebaseConfig);
        const storage = getStorage(app)
        const storageRef = ref(storage, `profile-${userId}.jpg`)

        try {
            return uploadBytes(storageRef, dataBuffer).then(async () => {
                this.logger.log(`Subida al bucket la imagen de perfil del usuario ID: ${userId}`)
                return await this.getProfilePic(userId)
            });
        } catch (error) {
            this.logger.warn('Error al subir el archivo')
        }
    }

    async getProfilePic(userId: number) {
        const app = initializeApp(firebaseConfig);
        const storage = getStorage(app)
        const gsReference = ref(storage, `profile-${userId}.jpg`)

        try {
            const url = await getDownloadURL(gsReference)
            return JSON.stringify(url)
        } catch (error) {
            this.logger.warn('Archivo no encontrado')
        }
    }

    async createAdminUser(dto: CreateUserDTO): Promise<number> {
        const {nickname, email} = dto;
        const exists = await this.UserRepository.findOne({where: [{nickname: nickname}, {email: email}]});
        if(exists) throw new BadRequestException({message: 'User already exits'});

        const rolAdmin = await this.RoleRepository.findOne({where: {type: RoleType.ADMIN}});
        const rolUser = await this.RoleRepository.findOne({where: {type: RoleType.USER}});
        if(!rolAdmin || !rolUser) throw new InternalServerErrorException({message: 'Missing mandatory roles'});

        const admin = this.UserRepository.create(dto);
        admin.roles = [rolAdmin, rolUser];
        await this.UserRepository.save(admin);
        return admin.id
    }

    async createRegularUser(dto: CreateUserDTO): Promise<number> {
        const {nickname, email} = dto;
        const exists = await this.UserRepository.findOne({where: [{nickname: nickname}, {email: email}]});
        if(exists) throw new BadRequestException({message: 'User already exits'});

        const rolUser = await this.RoleRepository.findOne({where: {type: RoleType.USER}});
        if(!rolUser) throw new InternalServerErrorException({message: 'Missing mandatory roles'});

        const regular = this.UserRepository.create(dto);
        regular.roles = [rolUser];
        await this.UserRepository.save(regular);
        return regular.id
    }
}
