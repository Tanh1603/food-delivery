import { Injectable } from '@nestjs/common';
import { ApiResponse } from '../../common/dto/api-response.dto';
import { successResponse } from '../../common/helper/api-response.helper';
import { getPaginationOptions } from '../../common/helper/pagination-query.helper';
import { PrismaService } from '../prisma/prisma.service';
import { RestaurantDto } from './dto/restaurant.dto';
import { RestaurantQuery } from './dto/restaurant.query';
import { MenuItemDto } from '../menu/dto/menu-item.dto';
import { MenuItemQuery } from '../menu/dto/menu-item.query';

@Injectable()
export class RestaurantService {
  constructor(private prisma: PrismaService) {}

  // create(createRestaurantDto: CreateRestaurantDto) {
  //   return 'This action adds a new restaurant';
  // }

  async findAll(query: RestaurantQuery): Promise<ApiResponse<RestaurantDto[]>> {
    const pagination = getPaginationOptions(query);

    const [restaurants, total] = await Promise.all([
      this.prisma.restaurant.findMany({
        ...pagination,
        select: {
          id: true,
          name: true,
          address: true,
          lat: true,
          lng: true,
          rating: true,
          cuisineType: true,
          status: true,
        },
      }),
      this.prisma.restaurant.count(),
    ]);

    return successResponse<RestaurantDto[]>(
      [...restaurants],
      'Fetch restaurants successfully!',
      {
        total,
        page: query.page ? query.page : 1,
        limit: query.limit ? query.limit : 10,
        totalPages: Math.ceil(total / (query.limit ? query.limit : 10)),
      },
    );
  }

  async findOne(id: string): Promise<ApiResponse<RestaurantDto>> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        address: true,
        lat: true,
        lng: true,
        rating: true,
        cuisineType: true,
        status: true,
      },
    });

    return successResponse<RestaurantDto>(
      { ...restaurant },
      'Fetch restaurant detail successfully!',
    );
  }

  // update(id: number, updateRestaurantDto: UpdateRestaurantDto) {
  //   return `This action updates a #id restaurant`;
  // }

  // remove(id: number) {
  //   return `This action removes a #id restaurant`;
  // }

  async getMenuItems(
    restaurantId: string,
    query: MenuItemQuery,
  ): Promise<ApiResponse<MenuItemDto[]>> {
    const pagination = getPaginationOptions(query);

    const [menuItems, total] = await Promise.all([
      this.prisma.menuItem.findMany({
        ...pagination,
        where: {
          restaurantId,
        },
        select: {
          id: true,
          name: true,
          price: true,
          available: true,
          inventory: true,
        },
      }),
      this.prisma.menuItem.count({
        where: {
          restaurantId,
        },
      }),
    ]);

    return successResponse<MenuItemDto[]>(
      [...menuItems],
      'Fetch menu items successfully!',
      {
        total,
        page: query.page ? query.page : 1,
        limit: query.limit ? query.limit : 10,
        totalPages: Math.ceil(total / (query.limit ? query.limit : 10)),
      },
    );
  }
}
