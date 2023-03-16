import { IsNumber,IsNotEmpty, IsString, Min, Max } from "class-validator";

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

    @IsNumber()
    @IsNotEmpty()
    user_id?: number;
}