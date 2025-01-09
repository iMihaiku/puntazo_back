import { type UserEntity } from './entity'

export interface UserRepository {
  createUser: (user: UserEntity) => Promise<void>
  getUserByUsername: (username: string) => Promise<UserEntity | null>
  getUserByUserId: (userId: string) => Promise<UserEntity | null>
  oauthGoogle: (code: string) => Promise<void>
}
