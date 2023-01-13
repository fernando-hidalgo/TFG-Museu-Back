import { IsNumber,IsNotEmpty, IsString, Min, Max } from "class-validator";
import { IsNotBlank } from "src/custom-decorators";

export class CreateRatingDTO {
    @IsNumber()
    @IsNotEmpty()
    @Min(0) @Max(5)
    value?: number;

    @IsString()
    text?: string;

    @IsNumber()
    @IsNotEmpty()
    artwork_id?: number;
}