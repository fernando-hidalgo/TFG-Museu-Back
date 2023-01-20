import { RoleType } from './../role.enum';
import { IsEnum } from "class-validator";

export class CreateRoleDTO {

    @IsEnum(RoleType, {message: 'Role must be user or admin'})
    type: string;
}