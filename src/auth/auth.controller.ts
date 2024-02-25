import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role.guard';
import { Auth, RoleProtected } from './decorators';
import { ValidRoles } from './interfaces';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({
    status: 200,
    description: 'User was created',
    type: User,
  })
  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @ApiResponse({
    status: 200,
    description: 'User was logged in',
    type: User,
  })
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @Headers() headers: IncomingHttpHeaders,
  ) {
    return {
      ok: true,
      user,
      userEmail,
      headers,
    };
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(@GetUser('id') userId: string) {
    return this.authService.checkAuthStatus(userId);
  }

  // @SetMetadata('roles', ['admin', 'super-admin'])

  @Get('private2')
  @RoleProtected(ValidRoles.SUPER_USER)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }

  @Get('private3')
  @Auth()
  privateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }
}
