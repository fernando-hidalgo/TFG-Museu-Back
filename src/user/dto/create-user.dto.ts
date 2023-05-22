import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, MaxLength } from "class-validator";
import { IsNotBlank } from "src/custom-decorators";

export class CreateUserDTO {
    @IsNotBlank({message: 'nickname must not be blank'})
    @MaxLength(10, {message: 'nickname max lenght is 10 characters'})
    @ApiProperty()
    nickname: string;

    @IsEmail()
    @ApiProperty()
    email: string;

    @IsNotBlank({message: 'password must not be blank'})
    @ApiProperty()
    password: string;
}