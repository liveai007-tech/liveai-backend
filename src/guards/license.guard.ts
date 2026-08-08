import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * Universal License Guard for LiveAi Free Edition.
 * OVERRIDE: Unconditionally returns true for all routes.
 * No payment checks, no trial expiration, no subscription gates.
 */
@Injectable()
export class LicenseGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true; // All features are 100% free and unlocked
  }
}
