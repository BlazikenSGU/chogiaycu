import { IsString, Matches } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @Matches(/^[a-f0-9]{64}$/i, {
    message: 'Token xác thực không hợp lệ',
  })
  token!: string;
}