import { ApiProperty } from '@nestjs/swagger';
import {
  CuisineType,
  RestaurantStatus,
} from '../../../../generated/prisma/enums';
export class RestaurantDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  lat: number;

  @ApiProperty()
  lng: number;

  @ApiProperty()
  rating: number;

  @ApiProperty({ enum: CuisineType })
  cuisineType: CuisineType;

  @ApiProperty({ enum: RestaurantStatus })
  status: RestaurantStatus;
}
