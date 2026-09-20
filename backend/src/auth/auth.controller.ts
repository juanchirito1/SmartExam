import { Body, Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.correo, loginDto.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(
    @Req()
    request: {
      user: {
        id: number;
      };
    },
  ) {
    return this.authService.me(request.user.id);
  }
}
