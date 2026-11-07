import {
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Matches,
} from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    slug!: string;


    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;


}

