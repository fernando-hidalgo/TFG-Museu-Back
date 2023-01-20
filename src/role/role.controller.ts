import { CreateRoleDTO } from './dto/create-role.dto';
import { RoleService } from './role.service';
import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';

@Controller('role')
export class RoleController {

    constructor(private readonly roleService: RoleService) {}

    @Get()
    getAll() {
        return this.roleService.getAll();
    }

    @UsePipes(new ValidationPipe({whitelist: true}))
    @Post()
    create(@Body() dto: CreateRoleDTO) {
        return this.roleService.create(dto);
    }
}