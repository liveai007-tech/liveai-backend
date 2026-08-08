import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export enum LicenseType {
  LIFETIME_ACTIVE = 'lifetime_active',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_users_email', { unique: true, where: '"deleted_at" IS NULL' })
  @Column({ name: 'email', type: 'varchar', length: 320, nullable: false })
  email: string;

  @Exclude()
  @Column({ name: 'password_hash', type: 'varchar', length: 72, nullable: true, default: null, select: false })
  passwordHash: string | null;

  @Column({ name: 'full_name', type: 'varchar', length: 100, nullable: false })
  fullName: string;

  @Column({ name: 'phone_number', type: 'text', nullable: true, default: null })
  phoneNumber: string | null;

  @Column({ name: 'phone_hmac', type: 'varchar', length: 64, nullable: true, default: null, select: false })
  phoneHmac: string | null;

  /** All users are permanently active. No payments, trials, or subscriptions. */
  @Index('idx_users_license_type')
  @Column({
    name: 'license_type',
    type: 'enum',
    enum: LicenseType,
    enumName: 'license_type_enum',
    default: LicenseType.LIFETIME_ACTIVE,
    nullable: false,
  })
  licenseType: LicenseType;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @BeforeInsert()
  normalizeEmailOnInsert(): void {
    if (this.email) this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  normalizeEmailOnUpdate(): void {
    if (this.email) this.email = this.email.toLowerCase().trim();
  }
}
