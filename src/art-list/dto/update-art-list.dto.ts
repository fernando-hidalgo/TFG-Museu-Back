import { IsString, ArrayNotEmpty } from "class-validator";
import { IsNumber } from "class-validator";
import { IsNotBlank } from "src/custom-decorators";

export class UpdateArtListDTO{
    @IsString()
    @IsNotBlank({message: "name should not be empty"})
    name?: string;

    @IsString()
    text?: string;

    /*@IsNumber({},{each: true})
    @ArrayNotEmpty()
    artworksIds?: number[];*/
}