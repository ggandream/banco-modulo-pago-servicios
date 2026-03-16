import { IsArray, IsInt, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MesPago {
  @IsInt()
  mes: number;

  @IsInt()
  anio: number;
}

export class CreatePagoDto {
  @IsInt()
  empresaId: number;

  @IsString()
  @IsNotEmpty()
  numeroContador: string;

  @IsInt()
  cuentaBancariaId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MesPago)
  mesesAPagar: MesPago[];
}
