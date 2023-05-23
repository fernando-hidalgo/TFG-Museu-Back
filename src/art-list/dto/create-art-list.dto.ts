import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { IsNotBlank } from "src/custom-decorators";

export class CreateArtListDTO{
    @IsString()
    @IsNotBlank({message: "name should not be empty"})
    @ApiProperty()
    name?: string;

    @IsString()
    @ApiProperty()
    text?: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    userId?: number;
}