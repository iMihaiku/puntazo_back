import { type TokenEntity, type UserEntity } from '@/domain/user/entity'
import { type UserRepository } from '@/domain/user/repository'
import { type UserRegisterDTO } from './DTO/register'
import { nanoid } from 'nanoid'
import { User, UserRole, TierAccount } from '@/domain/user/value'
import { encrypt, compare } from '@/lib/bcrypt/handler'
import { encrypted } from '@/lib/crypt/handler'
import { UserLoginDTO } from './DTO/login'
import jwt from 'jsonwebtoken'

export class UserCases {
  constructor(private readonly userRepository: UserRepository) {}

  public async createUser(
    username: string,
    email: string,
    password: string,
    token: TokenEntity,
    id?: string
  ): Promise<UserRegisterDTO | null> {
    const newId = nanoid(10)
    let passwordHash

    if (id) {
      passwordHash = password
      token.id = id
    } else {
      passwordHash = await encrypt(password)
      token.id = newId
    }

    token.token_value =
      token.token_value !== 'not_needed'
        ? encrypted(token.token_value)
        : 'not_needed'

    const user = new User(
      id ?? newId,
      username,
      email,
      passwordHash,
      UserRole.USER,
      token,
      '',
      TierAccount.FREE
    )
    console.log(user)
    try {
      await this.userRepository.createUser(user)
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Email already exists') {
        return null
      }
      throw error
    }
    return user
  }

  public async getUserByUsername(username: string): Promise<UserEntity | null> {
    return await this.userRepository.getUserByUsername(username)
  }

  public async getUserByUserId(userId: string): Promise<UserEntity | null> {
    return await this.userRepository.getUserByUserId(userId)
  }

  public async loginUser(
    email: string,
    password: string
  ): Promise<UserLoginDTO | null> {
    const user = await this.userRepository.getUserByUsername(email)
    if (user === null) {
      return null
    }
    const isValid = await compare(password, user.password)
    if (!isValid) {
      return null
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET no está definido')
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h'
      }
    )
    const tokenResponse: TokenEntity = {
      id: '',
      token_name: '',
      token_value: ''
    }
    const userDTO = new UserLoginDTO(
      user.id,
      user.username,
      token,
      user.role.toString(),
      tokenResponse,
      user.tierAccount
    )
    return userDTO
  }

  public async oauthGoogle(code: string): Promise<void> {
    await this.userRepository.oauthGoogle(code)
  }

  public async callbackOAuthGoogle(
    userData: any,
    refreshToken: string
  ): Promise<void> {
    if (await this.userRepository.getUserByUserId(userData.id as string)) {
      /**
       * Recuperar el refresh Token del usuario y actualizarlo
       */
    } else {
      const token: TokenEntity = {
        id: userData.id,
        token_name: 'refresh_token_google',
        token_value: refreshToken
      }
      token.token_value = encrypted(token.token_value)
      const user = new User(
        userData.id as string,
        userData.name as string,
        userData.email as string,
        'oauth-google',
        UserRole.USER,
        token,
        '',
        TierAccount.FREE
      )

      await this.userRepository.createUser(user)
    }
  }

  public async deleteUserByUsername(username: string): Promise<void> {
    await this.userRepository.deleteUserByUsername(username)
  }

  public async getTokenByUserId(userId: string): Promise<TokenEntity> {
    return await this.userRepository.getTokenByUserId(userId)
  }

  public async saveToken(token: TokenEntity): Promise<void> {
    await this.userRepository.saveToken(token)
  }

  public async updateToken(tokenValue: string, userId: string): Promise<void> {
    tokenValue = await encrypt(tokenValue)
    await this.userRepository.updateToken(tokenValue, userId)
  }

  public async updateSession(userId: string, sessionId: string): Promise<void> {
    await this.userRepository.updateSession(userId, sessionId)
  }

  public async verifySession(userId: string, sessionId: string): Promise<boolean> {
    return await this.userRepository.verifySession(userId, sessionId)
  }
}
