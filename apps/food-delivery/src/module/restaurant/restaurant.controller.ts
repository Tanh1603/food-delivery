import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ApiResponseWrapper } from '../../common/helper/api-response.helper';
import { MenuItemDto } from '../menu/dto/menu-item.dto';
import { MenuItemQuery } from '../menu/dto/menu-item.query';
import { RestaurantDto } from './dto/restaurant.dto';
import { RestaurantQuery } from './dto/restaurant.query';
import { RestaurantService } from './restaurant.service';

@Controller('restaurants')
@ApiBearerAuth()
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  // @Post()
  // create(@Body() createRestaurantDto: CreateRestaurantDto) {
  //   return this.restaurantService.create(createRestaurantDto);
  // }

  @Get()
  @ApiResponseWrapper(RestaurantDto, true)
  async findAll(@Query() query: RestaurantQuery) {
    return this.restaurantService.findAll(query);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
  })
  @ApiResponseWrapper(RestaurantDto)
  async findOne(@Param('id') id: string) {
    return this.restaurantService.findOne(id);
  }

  @Get(':id/menu')
  @ApiParam({
    name: 'id',
  })
  @ApiResponseWrapper(MenuItemDto, true)
  async getMenuItems(@Param('id') id: string, @Query() query: MenuItemQuery) {
    return this.restaurantService.getMenuItems(id, query);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateRestaurantDto: UpdateRestaurantDto,
  // ) {
  //   return this.restaurantService.update(+id, updateRestaurantDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.restaurantService.remove(+id);
  // }
}
