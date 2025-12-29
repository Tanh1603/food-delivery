/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { ApiResponse } from '../../common/dto/api-response.dto';
import { successResponse } from '../../common/helper/api-response.helper';
import { getPaginationOptions } from '../../common/helper/pagination-query.helper';
import { Cache_QUEUE, CacheJobName } from '../../common/redis/cache.processor';
import { RedisService } from '../../common/redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from './../../../generated/prisma/enums';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDto } from './dto/order.dto';
import { OrderQuery } from './dto/order.query';
import { ORDER_QUEUE, OrderJobName } from './order.processor';

type OrderItemValue = {
  menuItemId: string;
  quantity: number;
  price: number;
  name: string;
};
@Injectable()
export class OrderService {
  private logger = new Logger(OrderService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue(ORDER_QUEUE) private orderQueue: Queue,
    private redisService: RedisService,
    @InjectQueue(Cache_QUEUE) private cacheQueue: Queue,
  ) {}

  async create(dto: CreateOrderDto): Promise<ApiResponse<OrderDto>> {
    const storedItems: { key: string; quantity: number }[] = [];

    try {
      // 1. Idempotency check
      const existed = await this.prisma.order.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existed) {
        return {
          success: true,
          data: existed,
          message: 'Existing order',
        };
      }

      // 2. Normalize items
      const normalized = Object.values(
        dto.items.reduce(
          (acc, i) => {
            acc[i.menuItemId] ??= { menuItemId: i.menuItemId, quantity: 0 };
            acc[i.menuItemId].quantity += i.quantity;
            return acc;
          },
          {} as Record<string, any>,
        ),
      );

      // 3. Validate data
      const itemIds = normalized.map((i) => i.menuItemId);
      const quantities = normalized.map((i) => i.quantity);

      const [restaurant, user, menuItems] = await Promise.all([
        this.prisma.restaurant.findUnique({ where: { id: dto.restaurantId } }),
        this.prisma.user.findUnique({ where: { id: dto.userId } }),
        this.prisma.menuItem.findMany({
          where: {
            id: { in: itemIds },
            restaurantId: dto.restaurantId,
            available: true,
          },
          select: { id: true, name: true, price: true, inventory: true },
        }),
      ]);

      if (!user) throw new BadRequestException('User not found');
      if (!restaurant) throw new BadRequestException('Restaurant not found');
      if (menuItems.length !== normalized.length)
        throw new BadRequestException('Invalid menu items');

      // 4. Build snapshot and check inventory in Redis
      const itemsValue: OrderItemValue[] = [];
      for (const item of normalized) {
        const menuItem = menuItems.find((m) => m.id === item.menuItemId);
        if (!menuItem) throw new BadRequestException(`Menu item not found`);

        const ok = await this.redisService.decrementInventory(
          `inventory:${menuItem.id}`,
          item.quantity,
        );
        if (!ok)
          throw new BadRequestException(
            `Menu item "${menuItem.name}" is out of stock`,
          );

        storedItems.push({
          key: `inventory:${menuItem.id}`,
          quantity: item.quantity,
        });

        itemsValue.push({
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: item.quantity,
        });
      }

      // 5. Calculate total
      const total = itemsValue.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );

      // 6. Create order in DB and push job to queue
      const order = await this.prisma.order.create({
        data: {
          userId: dto.userId,
          restaurantId: dto.restaurantId,
          phone: dto.phone,
          deliveryAddress: dto.deliveryAddress,
          note: dto.note,
          idempotencyKey: dto.idempotencyKey,
          total: total, // will update later
          itemsValue: itemsValue,
          orderItems: {
            createMany: {
              data: (itemsValue as unknown as OrderItemValue[]).map((item) => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          },
        },
      });

      await this.orderQueue.add(
        OrderJobName.CREATE,
        { orderId: order.id, itemIds, quantities },
        {
          attempts: 5,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      // 7. Return immediately (202 Accepted)
      return {
        success: true,
        data: {
          id: order.id,
          restaurantId: order.restaurantId,
          userId: order.userId,
          phone: order.phone,
          deliveryAddress: order.deliveryAddress,
          status: order.status,
          note: order.note,
          total: order.total,
          createdAt: order.createdAt,
          updatedAt: order.createdAt,
          itemsValue: order.itemsValue,
        },
        message: 'Order is being processed',
      };
    } catch (error) {
      this.logger.error(error);
      if (storedItems.length)
        await this.redisService.incrementInventoryBatch(storedItems);
      throw error;
    }
  }

  async findAll(query: OrderQuery): Promise<ApiResponse<OrderDto[]>> {
    const key = `orders:list${JSON.stringify(query)}`;
    const cache = await this.redisService.get(key);
    if (cache) {
      return JSON.parse(cache);
    }

    const pagination = getPaginationOptions(query);

    const [orders, total] = await Promise.all([
      this.prisma.order
        .findMany({
          ...pagination,
          include: {
            orderItems: true,
          },
        })
        .then((data) =>
          data.map((item) => ({
            id: item.id,
            restaurantId: item.restaurantId,
            userId: item.userId,
            phone: item.phone,
            deliveryAddress: item.deliveryAddress,
            status: item.status,
            total: item.total,
            createdAt: item.createdAt,
            updatedAt: item.createdAt,
            itemsValue: item.itemsValue,
          })),
        ),
      this.prisma.order.count(),
    ]);

    const response = successResponse<OrderDto[]>(
      [...orders],
      'Fetch list order successfully!',
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

  async updateStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<ApiResponse<OrderDto>> {
    // 1. check order tồn tại
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    // 2. update status
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { orderItems: true }, // lấy luôn các item nếu cần
    });

    await this.cacheQueue.add(
      CacheJobName.CLEAR_CACHE,
      { key: 'orders:' },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    // 3. trả về response
    return {
      success: true,
      data: {
        id: updatedOrder.id,
        restaurantId: updatedOrder.restaurantId,
        userId: updatedOrder.userId,
        phone: updatedOrder.phone,
        deliveryAddress: updatedOrder.deliveryAddress,
        status: updatedOrder.status,
        total: updatedOrder.total,
        createdAt: updatedOrder.createdAt,
        updatedAt: updatedOrder.updatedAt,
        itemsValue: updatedOrder.itemsValue,
      },
      message: `Update order status successfully!`,
    };
  }

  async findOne(id: string): Promise<ApiResponse<OrderDto>> {
    const key = `orders:detail${id}`;
    const cache = await this.redisService.get(key);
    if (cache) {
      return JSON.parse(cache);
    }

    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const response = {
      success: true,
      data: {
        id: order.id,
        restaurantId: order.restaurantId,
        userId: order.userId,
        phone: order.phone,
        deliveryAddress: order.deliveryAddress,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        itemsValue: order.itemsValue,
      },
      message: 'Fetch order detail successfully!',
    };

    await this.redisService.set(key, JSON.stringify(response), 300);

    return response;
  }
}
