import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    Max,
    MaxLength,
    Min,
    IsEnum,
    MIN
} from 'class-validator';
import { ProductStatus } from '../../generated/prisma/enums.js';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    name!: string;

    @IsString()
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    @MaxLength(220)
    slug!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsInt()
    @Min(0)
    price!: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    originalPrice?: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    size!: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    conditionPercent?: number;

    @IsOptional()
    @IsString()
    conditionNote?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    stock?: number;

    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus;

    @IsUUID()
    brandId!: string;

    @IsUUID()
    categoryId!: string;

}