import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Min, Max } from "class-validator";

export class UpdateRatingDTO {
    @IsNumber()
    @Min(0) @Max(5)
    @ApiProperty()
    value?: number;

    @IsString()
    @ApiProperty()
    text?: string;
}