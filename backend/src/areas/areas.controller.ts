import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('areas')
@UseGuards(JwtAuthGuard)
export class AreasController {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  findAll() {
    return this.prisma.area.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }
}