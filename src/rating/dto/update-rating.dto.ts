import { IsNumber, IsString, Min, Max } from "class-validator";

export class UpdateRatingDTO {
    @IsNumber()
    @Min(0) @Max(5)
    value?: number;

    @IsString()
    text?: string;
}