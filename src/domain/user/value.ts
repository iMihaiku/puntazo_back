import { type UserEntity } from './entity'

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}

export enum TierAccount {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM'
}

export class User implements UserEntity {
  public readonly id: string
  public readonly username: string
  public readonly email: string
  public readonly password: string
  public readonly role: UserRole
  public readonly endpoint?: string
  public readonly tokenUsage: number
  public readonly tierAccount: string

  constructor(
    id: string,
    username: string,
    email: string,
    password: string,
    role: UserRole,
    endpoint?: string,
    tokenUsage: number = 0,
    tierAccount: TierAccount = TierAccount.FREE
  ) {
    this.id = id
    this.username = username
    this.email = email
    this.password = password
    this.role = role
    this.endpoint = endpoint
    this.tokenUsage = tokenUsage
    this.tierAccount = tierAccount
  }
}