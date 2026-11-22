import { IsJSON, IsNotEmpty, IsString } from 'class-validator';

export class CreateProductWithImagesDto {
  @IsString()
  @IsNotEmpty()
  @IsJSON()
  payload!: string;
}