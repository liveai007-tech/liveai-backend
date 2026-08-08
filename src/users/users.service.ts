import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }

  async updateProfile(id: string, dto: { fullName?: string; phoneNumber?: string }): Promise<User> {
    const user = await this.findById(id);
    if (dto.fullName) user.fullName = dto.fullName.trim();
    if (dto.phoneNumber !== undefined) user.phoneNumber = dto.phoneNumber;
    return this.userRepo.save(user);
  }

  async softDelete(id: string): Promise<void> {
    await this.findById(id);
    await this.userRepo.softDelete(id);
  }
}
