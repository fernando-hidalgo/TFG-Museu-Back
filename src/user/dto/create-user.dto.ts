import { IsEmail, MaxLength } from "class-validator";
import { IsNotBlank } from "src/custom-decorators";

export class CreateUserDTO {

    @IsNotBlank({message: 'nickname must not be blank'})
    @MaxLength(10, {message: 'nickname max lenght is 10 characters'})
    nickname: string;

    @IsEmail()
    email: string;

    @IsNotBlank({message: 'password must not be blank'})
    password: string;
}