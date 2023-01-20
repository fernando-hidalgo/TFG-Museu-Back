import { CreateRoleDTO } from './dto/create-role.dto';
import { RoleEntity } from './role.entity';
import { RoleRepository } from './role.repository';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleType } from './role.enum';

@Injectable()
export class RoleService {

    constructor(
        @InjectRepository(RoleEntity)
        private readonly roleRepository: RoleRepository
    ) {}

    async getAll(): Promise<RoleEntity[]> {
        const roles = await this.roleRepository.find();
        if(!roles.length) throw new NotFoundException({message: "No roles found"});
        return roles;
    }

    async create(dto: CreateRoleDTO): Promise<any> {
        const exists = await this.roleRepository.findOne({where: {type: dto.type as RoleType}});
        if(exists) throw new BadRequestException({message: "Role already exists"});
        await this.roleRepository.save(dto as RoleEntity);
    }
}