import { Type } from 'class-transformer';
import { IsOptional, IsNumber, IsString, IsObject } from 'class-validator';
export class ListQueryDTO {
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  per_page?: number = 10;

  @IsOptional()
  @IsString()
  keywords: string = '';

  @IsOptional()
  @IsObject()
  filters?: Record<string, string>; // filters like {status: "active", category: "finance"}
}