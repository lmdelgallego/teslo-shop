import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/products/entities';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @ApiProperty({
    example: 'f6720de4-4f50-4991-8ed2-65a15b91f1b0',
    description: 'Unique identifier',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'email@email.com',
    description: 'User email',
    format: 'email',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  email: string;

  @ApiProperty({
    example: 'password',
    description: 'User password',
    minLength: 6,
    maxLength: 50,
  })
  @Column('text', {
    select: false,
  })
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  @Column('text')
  fullName: string;

  @ApiProperty({
    example: true,
    description: 'User status',
  })
  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @ApiProperty({
    example: ['user'],
  })
  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];

  @ApiProperty({
    description: 'User products',
    type: () => [Product],
  })
  @OneToMany(() => Product, (product) => product.user)
  product: Product;

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkEmailBeftoUpdate() {
    this.emailToLowerCase();
  }
}
