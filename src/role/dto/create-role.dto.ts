import { ApiProperty } from '@nestjs/swagger';
import { RoleType } from './../role.enum';
import { IsEnum } from "class-validator";

export class CreateRoleDTO {
    @IsEnum(RoleType, {message: 'Role must be user or admin'})
    @ApiProperty()
    type: string;
}