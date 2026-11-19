import {
    IsString,
    MinLength,
    MaxLength,
    Matches,
} from 'class-validator';

export class ResetPasswordDto {
    @IsString()
    token: string;

    @IsString()
    @MinLength(8)
    @MaxLength(72)
    newPassword: string;

    @IsString()
    confirmPassword: string;
}