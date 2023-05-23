import { ApiProperty } from "@nestjs/swagger";
import { IsNumber,IsNotEmpty, IsString, Min, Max } from "class-validator";

export class CreateRatingDTO {
    @IsNumber()
    @IsNotEmpty()
    @Min(0) @Max(5)
    @ApiProperty()
    value?: number;

    @IsString()
    @ApiProperty()
    text?: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    artwork_id?: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    user_id?: number;
}