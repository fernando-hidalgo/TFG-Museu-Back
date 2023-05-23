import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { IsNotBlank } from "src/custom-decorators";

export class UpdateArtListDTO{
    @IsString()
    @IsNotBlank({message: "name should not be empty"})
    @ApiProperty()
    name?: string;

    @IsString()
    @ApiProperty()
    text?: string;

    @ApiProperty()
    artworksIds?: number[];
}