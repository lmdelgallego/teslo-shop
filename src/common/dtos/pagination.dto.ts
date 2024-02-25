import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDTO {
  @ApiProperty({
    type: Number,
    description: 'Limit the number of records',
    default: 10,
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    type: Number,
    description: 'Offset the records',
    default: 0,
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
