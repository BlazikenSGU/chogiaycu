import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

@Injectable()
export class AppService {

  constructor(private readonly prisma: PrismaService) { }

  async getHealth() {
    const totalUsers = await this.prisma.user.count();

    return {
      status: 'ok',
      message: 'API is healthy',
      database: 'connected',
      totalUsers: totalUsers,
      timestamp: new Date().toISOString(),
    };
  }
}
