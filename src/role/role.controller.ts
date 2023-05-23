import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateRoleDTO } from './dto/create-role.dto';
import { RoleService } from './role.service';
import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';

@Controller('role')
export class RoleController {

    constructor(private readonly roleService: RoleService) {}

    @Get()
    @ApiTags('Role')
    @ApiOperation({ summary: 'Listar todos los roles existentes'})
    getAll() {
        return this.roleService.getAll();
    }

    //TODO: Proteger despues de implementar Vista Admin
    @UsePipes(new ValidationPipe({whitelist: true}))
    @Post()
    @ApiTags('Role')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Crear nuevo rol'})
    create(@Body() dto: CreateRoleDTO) {
        return this.roleService.create(dto);
    }
}