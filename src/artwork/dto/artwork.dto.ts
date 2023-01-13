import { IsBoolean, IsNotEmpty, IsNumber, IsString, Max, Min } from "class-validator";
import { IsNotBlank } from "src/custom-decorators";

export class ArtworkDTO {
    @IsString()
    @IsNotBlank({message: "name should not be empty"})
    name?: string;

    @IsString()
    date?: string;

    @IsString()
    artist?: string;

    @IsString()
    @IsNotBlank({message: "museum should not be empty"})
    museum?: string;

    @IsString()
    colection?: string;

    @IsBoolean()
    display?: boolean;

    @IsString()
    room?: string;
    
    @IsNumber()
    @IsNotEmpty()
    @Min(0) @Max(5)
    averageRating?: number;
}