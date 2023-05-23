import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsString, Max, Min } from "class-validator";
import { IsNotBlank } from "src/custom-decorators";

export class ArtworkDTO {
    @IsString()
    @IsNotBlank({message: "name should not be empty"})
    @ApiProperty()
    name?: string;

    @IsString()
    @ApiProperty()
    date?: string;

    @IsString()
    @ApiProperty()
    artist?: string;

    @IsString()
    @IsNotBlank({message: "picture should not be empty"})
    @ApiProperty()
    picLink?: string;

    @IsString()
    @IsNotBlank({message: "museum should not be empty"})
    @ApiProperty()
    museum?: string;

    @IsString()
    @ApiProperty()
    description?: string;

    @IsString()
    @ApiProperty()
    style?: string;

    @IsString()
    @ApiProperty()
    colection?: string;

    @IsBoolean()
    @ApiProperty()
    display?: boolean;

    @IsString()
    @ApiProperty()
    room?: string;
    
    @IsNumber()
    @IsNotEmpty()
    @Min(0) @Max(5)
    @ApiProperty()
    averageRating?: number;
}