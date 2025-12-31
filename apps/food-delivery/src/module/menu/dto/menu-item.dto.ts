import { ApiProperty } from '@nestjs/swagger';

export class MenuItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  available: boolean;

  @ApiProperty()
  inventory: number | null;
}
