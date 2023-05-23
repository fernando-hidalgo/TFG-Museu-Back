import { ApiProperty } from "@nestjs/swagger";
import { IsNotBlank } from "src/custom-decorators";

export class LoginUserDTO {
    @IsNotBlank({message: 'Nickname or mail must not be blank'})
    @ApiProperty()
    nick_or_mail: string;

    @IsNotBlank({message: 'password must not be blank'})
    @ApiProperty()
    password: string;
}