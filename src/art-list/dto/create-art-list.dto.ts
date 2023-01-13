import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { IsNotBlank } from "src/custom-decorators";

export class CreateArtListDTO{
    @IsString()
    @IsNotBlank({message: "name should not be empty"})
    name?: string;

    @IsString()
    text?: string;

    @IsNumber()
    @IsNotEmpty()
    artworkId?: number;
}