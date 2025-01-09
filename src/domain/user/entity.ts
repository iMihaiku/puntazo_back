import { type UserRole } from './value'

export interface UserEntity {
  id: string
  username: string
  email: string
  password: string
  role: UserRole
  endpoint?: string | undefined
  token: TokenEntity
  tierAccount: string
}

export interface TokenEntity {
  id: string
  token_name: string
  token_value: string
}
