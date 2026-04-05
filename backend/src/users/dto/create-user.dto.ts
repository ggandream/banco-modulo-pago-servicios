import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nombreCompleto: string;

  @IsString()
  @IsNotEmpty()
  nombreUsuario: string;

  @IsEmail()
  correo: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsInt()
  rolId: number;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nombreCompleto?: string;

  @IsOptional()
  @IsString()
  nombreUsuario?: string;

  @IsOptional()
  @IsEmail()
  correo?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsInt()
  rolId?: number;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
