import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../user/dto/user.dto';

export class AuthResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty({
    type: UserDto,
  })
  user: UserDto;
}
