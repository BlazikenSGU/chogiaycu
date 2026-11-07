import {
    IsString,
    MaxLength,
    MinLength
} from 'class-validator';

export class UpdateProfileDto {
    @IsString()
    @MinLength(2, {
        message: 'Họ và tên phải có ít nhất 2 ký tự',
    })
    @MaxLength(100, {
        message: 'Họ và tên không được vượt quá 100 ký tự',
    })
    name!: string;
}