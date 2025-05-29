import { type TokenEntity, type UserEntity } from './entity'

export interface UserRepository {
  createUser: (user: UserEntity) => Promise<void>
  getUserByUsername: (username: string) => Promise<UserEntity | null>
  getUserByUserId: (userId: string) => Promise<UserEntity | null>
  oauthGoogle: (code: string) => Promise<void>
  deleteUserByUsername: (username: string) => Promise<void>
  getTokenByUserId: (userid: string) => Promise<TokenEntity>
  saveToken: (token: TokenEntity) => Promise<void>
  updateToken: (tokenValue: string, userId: string) => Promise<void>
  updateSession: (userId: string, sessionId: string) => Promise<void>
  verifySession: (userId: string, sessionId: string) => Promise<boolean>
}
