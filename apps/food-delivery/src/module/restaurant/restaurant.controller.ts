import { Controller, Get, Param, Query } from '@nestjs/common';
import { RestaurantQuery } from './dto/restaurant.query';
import { RestaurantService } from './restaurant.service';
import { MenuItemQuery } from '../menu/dto/menu-item.query';

@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  // @Post()
  // create(@Body() createRestaurantDto: CreateRestaurantDto) {
  //   return this.restaurantService.create(createRestaurantDto);
  // }

  @Get()
  async findAll(@Query() query: RestaurantQuery) {
    return this.restaurantService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.restaurantService.findOne(id);
  }

  @Get(':id/menu')
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
