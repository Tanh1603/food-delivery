import { Injectable } from '@nestjs/common';
import { ApiResponse } from '../../common/dto/api-response.dto';
import { successResponse } from '../../common/helper/api-response.helper';
import { getPaginationOptions } from '../../common/helper/pagination-query.helper';
import { PrismaService } from '../prisma/prisma.service';
import { RestaurantDto } from './dto/restaurant.dto';
import { RestaurantQuery } from './dto/restaurant.query';
import { MenuItemDto } from '../menu/dto/menu-item.dto';
import { MenuItemQuery } from '../menu/dto/menu-item.query';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class RestaurantService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async findAll(query: RestaurantQuery): Promise<ApiResponse<RestaurantDto[]>> {
    const key = `restaurants:list:${JSON.stringify(query)}`;
    const cached = await this.redisService.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

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

    const response = successResponse<RestaurantDto[]>(
      [...restaurants],
      'Fetch restaurants successfully!',
      {
        total,
        page: query.page ? query.page : 1,
        limit: query.limit ? query.limit : 10,
        totalPages: Math.ceil(total / (query.limit ? query.limit : 10)),
      },
    );

    await this.redisService.set(key, JSON.stringify(response), 300); // cache for 5 minutes

    return response;
  }

  async findOne(id: string): Promise<ApiResponse<RestaurantDto>> {
    const key = `restaurants:detail:${id}`;
    const cache = await this.redisService.get(key);
    if (cache) {
      return JSON.parse(cache);
    }

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

    const response = successResponse<RestaurantDto>(
      { ...restaurant },
      'Fetch restaurant detail successfully!',
    );

    await this.redisService.set(key, JSON.stringify(response), 300);

    return response;
  }

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

    const redisKeys = menuItems.map((item) => `inventory:${item.id}`);
    const pipeline = this.redisService.pipeline();
    redisKeys.forEach((key) => pipeline.get(key));
    const results = await pipeline.exec();
    const menuItemsWithInventory = menuItems.map((item, idx) => {
      const redisQty = results[idx][1]; // [err, value]
      return {
        ...item,
        inventory: redisQty !== null ? Number(redisQty) : 0, // fallback 0 nếu Redis null
      };
    });

    const response = successResponse<MenuItemDto[]>(
      menuItemsWithInventory,
      'Fetch menu items successfully!',
      {
        total,
        page: query.page ? query.page : 1,
        limit: query.limit ? query.limit : 10,
        totalPages: Math.ceil(total / (query.limit ? query.limit : 10)),
      },
    );

    return response;
  }
}
