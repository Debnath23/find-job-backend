import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class LoginDto {
  @ApiProperty({required: true})
  @IsEmail()
  readonly email: string;

  @ApiProperty({required: true})
  readonly password: string;
}
