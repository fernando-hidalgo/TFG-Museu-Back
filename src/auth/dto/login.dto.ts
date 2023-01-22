import { IsNotBlank } from "src/custom-decorators";

export class LoginUserDTO {

    @IsNotBlank({message: 'Nickname or mail must not be blank'})
    nick_or_mail: string;

    @IsNotBlank({message: 'password must not be blank'})
    password: string;
}