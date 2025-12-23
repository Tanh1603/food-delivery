import { OrderStatus } from './../../../generated/prisma/enums';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiResponse } from '../../common/dto/api-response.dto';
import { OrderDto } from './dto/order.dto';
import { OrderQuery } from './dto/order.query';
import { getPaginationOptions } from '../../common/helper/pagination-query.helper';
import { successResponse } from '../../common/helper/api-response.helper';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  // async create(dto: CreateOrderDto): Promise<ApiResponse<OrderDto>> {
  //   // idempotency check
  //   const existed = await this.prisma.order.findUnique({
  //     where: { idempotencyKey: dto.idempotencyKey },
  //   });

  //   if (existed)
  //     return {
  //       success: true,
  //       data: {
  //         id: existed.id,
  //         restaurantId: existed.restaurantId,
  //         userId: existed.userId,
  //         phone: existed.phone,
  //         deliveryAddress: existed.deliveryAddress,
  //         status: existed.status,
  //         total: existed.total,
  //         createdAt: existed.createdAt,
  //         updatedAt: existed.createdAt,
  //         itemsValue: existed.itemsValue,
  //       },
  //       message: 'Existing order',
  //     };

  //   // fetch menu items
  //   const menuItems = await this.prisma.menuItem.findMany({
  //     where: {
  //       id: { in: dto.items.map((i) => i.menuItemId) },
  //       restaurantId: dto.restaurantId,
  //       available: true,
  //     },
  //   });

  //   if (menuItems.length !== dto.items.length) {
  //     throw new BadRequestException(
  //       'Some menu items are invalid, unavailable, or not belong to this restaurant',
  //     );
  //   }

  //   const orderItems = dto.items.map((item) => {
  //     const menuItem = menuItems.find((m) => m.id === item.menuItemId);
  //     return {
  //       menuItemId: item.menuItemId,
  //       quantity: item.quantity,
  //       price: menuItem.price,
  //     };
  //   });

  //   const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  //   const order = await this.prisma.order.create({
  //     data: {
  //       restaurantId: dto.restaurantId,
  //       userId: dto.userId,
  //       phone: dto.phone,
  //       deliveryAddress: dto.deliveryAddress,
  //       note: dto.note,
  //       idempotencyKey: dto.idempotencyKey,
  //       status: OrderStatus.PENDING,
  //       total,
  //       itemsValue: orderItems, // snapshot JSON
  //       orderItems: {
  //         create: orderItems,
  //       },
  //     },
  //     include: {
  //       orderItems: true,
  //     },
  //   });

  //   return {
  //     success: true,
  //     data: {
  //       id: order.id,
  //       restaurantId: order.restaurantId,
  //       userId: order.userId,
  //       phone: order.phone,
  //       deliveryAddress: order.deliveryAddress,
  //       status: order.status,
  //       total: order.total,
  //       createdAt: order.createdAt,
  //       updatedAt: order.createdAt,
  //       itemsValue: order.itemsValue,
  //     },
  //     message: 'Creat order successfully!',
  //   };
  // }

  async create(dto: CreateOrderDto): Promise<ApiResponse<OrderDto>> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: dto.restaurantId },
    });
    if (!restaurant) throw new BadRequestException('Restaurant không tồn tại');

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) throw new BadRequestException('User không tồn tại');

    // 1. idempotency check
    const existed = await this.prisma.order.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
    });

    if (existed) {
      return {
        success: true,
        data: {
          id: existed.id,
          restaurantId: existed.restaurantId,
          userId: existed.userId,
          phone: existed.phone,
          deliveryAddress: existed.deliveryAddress,
          status: existed.status,
          total: existed.total,
          createdAt: existed.createdAt,
          updatedAt: existed.updatedAt,
          itemsValue: existed.itemsValue,
        },
        message: 'Existing order',
      };
    }

    // 2. fetch menu items (BẮT BUỘC cùng restaurant)
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: dto.items.map((i) => i.menuItemId) },
        restaurantId: dto.restaurantId,
        available: true,
      },
    });

    if (menuItems.length !== dto.items.length) {
      throw new BadRequestException(
        'Some menu items are invalid, unavailable, or not belong to this restaurant',
      );
    }

    // 3. validate inventory
    for (const item of dto.items) {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);

      if (menuItem.inventory !== null && item.quantity > menuItem.inventory) {
        throw new BadRequestException(
          `Menu item "${menuItem.name}" is out of stock`,
        );
      }
    }

    // 4. build order items
    const orderItems = dto.items.map((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
      };
    });

    const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // 5. TRANSACTION: create order + lock inventory
    const order = await this.prisma.$transaction(async (tx) => {
      // 5.1 trừ inventory (chỉ khi inventory != null)
      for (const item of dto.items) {
        const menuItem = menuItems.find((m) => m.id === item.menuItemId);

        if (menuItem.inventory !== null) {
          const updated = await tx.menuItem.updateMany({
            where: {
              id: menuItem.id,
              inventory: {
                gte: item.quantity, // optimistic lock
              },
            },
            data: {
              inventory: {
                decrement: item.quantity,
              },
              available:
                menuItem.inventory - item.quantity - 0 <= 0 ? false : undefined,
            },
          });

          if (updated.count === 0) {
            throw new BadRequestException(
              `Menu qq "${menuItem.name}" is out of stock`,
            );
          }
        }
      }

      // 5.2 create order
      return tx.order.create({
        data: {
          restaurantId: dto.restaurantId,
          userId: dto.userId,
          phone: dto.phone,
          deliveryAddress: dto.deliveryAddress,
          note: dto.note,
          idempotencyKey: dto.idempotencyKey,
          status: OrderStatus.PENDING,
          total,
          itemsValue: orderItems,
          orderItems: {
            create: orderItems,
          },
        },
      });
    });

    return {
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
      message: 'Create order successfully!',
    };
  }

  async findAll(query: OrderQuery): Promise<ApiResponse<OrderDto[]>> {
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

    return successResponse<OrderDto[]>(
      [...orders],
      'Fetch list order successfully!',
      {
        total,
        page: query.page ? query.page : 1,
        limit: query.limit ? query.limit : 10,
        totalPages: Math.ceil(total / (query.limit ? query.limit : 10)),
      },
    );
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
      throw new BadRequestException('Order không tồn tại');
    }

    // 2. update status
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { orderItems: true }, // lấy luôn các item nếu cần
    });

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
      message: `Update order status thành công!`,
    };
  }

  // findOne(id: number) {
  //   return `This action returns a #id order`;
  // }

  // update(id: number, updateOrderDto: UpdateOrderDto) {
  //   return `This action updates a #id order`;
  // }

  // remove(id: number) {
  //   return `This action removes a #id order`;
  // }
}
