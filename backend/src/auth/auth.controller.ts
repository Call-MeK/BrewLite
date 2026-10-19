import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { CredentialsDto } from './credentials.dto.js';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() credentials: CredentialsDto) {
    return this.auth.register(credentials);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() credentials: CredentialsDto) {
    return this.auth.login(credentials);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getCurrentUser(@Req() request: AuthenticatedRequest) {
    return this.auth.getCurrentUser(request.user.id);
  }
}
