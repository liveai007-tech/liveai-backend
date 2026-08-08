import { Controller, Get, Patch, Delete, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthReq extends Request { user: { sub: string; email: string }; }

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@Req() req: AuthReq) {
    return this.usersService.findById(req.user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update profile' })
  async updateMe(@Req() req: AuthReq, @Body() body: { fullName?: string; phoneNumber?: string }) {
    return this.usersService.updateProfile(req.user.sub, body);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Soft delete user account' })
  async deleteMe(@Req() req: AuthReq) {
    await this.usersService.softDelete(req.user.sub);
    return { message: 'Account deleted successfully.' };
  }
}
