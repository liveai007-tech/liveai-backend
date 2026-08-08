import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{
      name: 'global',
      ttl: 60_000,
      limit: 60,
    }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const rawUrl = config.getOrThrow<string>('DATABASE_URL');
        const url = new URL(rawUrl);

        let host = url.hostname;
        let port = parseInt(url.port, 10) || 5432;
        let username = decodeURIComponent(url.username);
        const password = decodeURIComponent(url.password);
        const database = url.pathname.replace(/^\//, '') || 'postgres';

        // Auto-fix for Supabase direct URLs on IPv4-only hosts (Render free tier):
        // Convert db.[ref].supabase.co:5432 -> aws-0-ap-south-1.pooler.supabase.com:6543 with username postgres.[ref]
        if (host.includes('.supabase.co') && !host.includes('pooler')) {
          const projectRef = host.split('.')[0];
          host = 'aws-0-ap-south-1.pooler.supabase.com';
          port = 6543;
          if (!username.includes('.')) {
            username = `${username}.${projectRef}`;
          }
        }

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          entities: [User],
          synchronize: true,
          ssl: { rejectUnauthorized: false },
          retryAttempts: 10,
          retryDelay: 3000,
          extra: {
            connectionTimeoutMillis: 15000,
          },
        };
      },
    }),
    AuthModule,
    UsersModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
