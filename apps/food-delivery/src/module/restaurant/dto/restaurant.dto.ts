import {
  CuisineType,
  RestaurantStatus,
} from '../../../../generated/prisma/enums';
export class RestaurantDto {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  cuisineType: CuisineType;
  status: RestaurantStatus;
}
