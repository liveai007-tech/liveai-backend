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

        // Parse the URL into individual components to avoid pg URL-parsing issues
        // (especially @ signs in passwords and sslmode query params)
        const url = new URL(rawUrl);
        const host     = url.hostname;
        const port     = parseInt(url.port, 10) || 5432;
        const username = decodeURIComponent(url.username);
        const password = decodeURIComponent(url.password);
        const database = url.pathname.replace(/^\//, '');

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
          retryAttempts: 5,
          retryDelay: 3000,
          // Force IPv4 at pg driver level (belt & suspenders with dns fix in main.ts)
          extra: {
            family: 4,
            connectionTimeoutMillis: 10000,
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
