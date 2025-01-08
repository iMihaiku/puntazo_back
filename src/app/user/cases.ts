import { nanoid } from 'nanoid'
import { type UserEntity } from '@/domain/user/entity'
import { type UserRepository } from '@/domain/user/repository'
import { User, UserRole, TierAccount } from '@/domain/user/value'
import { encrypt, compare } from '@/lib/bcrypt/handler'
import { UserLoginDTO } from './DTO/login'
import { type UserRegisterDTO } from './DTO/register'
import jwt from 'jsonwebtoken'

export class UserCases {
  constructor(private readonly userRepository: UserRepository) {}

  public async createUser(
    username: string,
    email: string,
    password: string
  ): Promise<UserRegisterDTO | null> {
    const newId = nanoid(10)
    const passwordHash = await encrypt(password)
    const user = new User(
      newId,
      username,
      email,
      passwordHash,
      UserRole.USER,
      '',
      0,
      TierAccount.FREE
    )
    await this.userRepository.createUser(user)
    return null
  }

  public async getUserByUsername(username: string): Promise<UserEntity | null> {
    return await this.userRepository.getUserByUsername(username)
  }

  public async getUserByUserId(userId: string): Promise<UserEntity | null> {
    return await this.userRepository.getUserByUserId(userId)
  }

  public async loginUser(
    username: string,
    password: string
  ): Promise<UserLoginDTO | null> {
    const user = await this.userRepository.getUserByUsername(username)
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
    const userDTO = new UserLoginDTO(
      user.id,
      token,
      user.role.toString(),
      user.tokenUsage || 0,
      user.tierAccount
    )
    console.log(userDTO, 'userDTO')
    return userDTO
  }
}
