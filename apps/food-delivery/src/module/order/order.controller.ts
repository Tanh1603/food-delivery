import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { OrderStatus } from '../../../generated/prisma/enums';
import { ApiResponseWrapper } from '../../common/helper/api-response.helper';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDto } from './dto/order.dto';
import { OrderQuery } from './dto/order.query';
import { OrderService } from './order.service';

@Controller('orders')
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiBody({
    type: CreateOrderDto,
  })
  @ApiResponseWrapper(OrderDto, true)
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @ApiResponseWrapper(OrderDto, true)
  findAll(@Query() query: OrderQuery) {
    return this.orderService.findAll(query);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
  })
  @ApiResponseWrapper(OrderDto)
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id/status')
  @ApiParam({
    name: 'id',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: Object.values(OrderStatus) },
      },
      required: ['status'],
    },
  })
  @ApiResponseWrapper(OrderDto)
  updateStatus(
    @Param('id') id: string,
    @Body() { status }: { status: OrderStatus },
  ) {
    return this.orderService.updateStatus(id, status);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.orderService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
  //   return this.orderService.update(+id, updateOrderDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.orderService.remove(+id);
  // }
}
