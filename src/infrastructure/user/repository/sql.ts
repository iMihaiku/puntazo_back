import { type TokenEntity, type UserEntity } from '@/domain/user/entity'
import { type UserRepository } from '@/domain/user/repository'
import { tursoClient } from '@/lib/db/turso'
import { Server, LogColor } from '@/lib/server.logs'
import { TierAccount, User, type UserRole } from '@/domain/user/value'
import { type ResultSet } from '@libsql/client/.'

export class SQLRepository implements UserRepository {
  public async createUser(user: UserEntity): Promise<void> {
    if (await this.checkUsernameExists(user.username)) {
      throw new Error('Username already exists')
    }
    await tursoClient.execute({
      sql: `INSERT INTO 
      token_table (id, token_name, token_value) 
      VALUES (:id, :name, :value)`,
      args: {
        id: user.token.id,
        name: user.token.token_name,
        value: user.token.token_value
      }
    })
    await tursoClient.execute({
      sql: `INSERT INTO 
      users (id, username, email, password, role, endpoint, token_reference, tierAccount) 
      VALUES (:id, :username, :email, :password, :role, :endpoint, :tokenReference, :tierAccount)`,
      args: {
        id: user.id,
        username: user.username,
        password: user.password,
        email: user.email,
        role: user.role,
        endpoint: null,
        tokenReference: user.token.id,
        tierAccount: TierAccount.FREE
      }
    })
    Server.log(
      `User ${user.username} created with id: ${user.id}`,
      LogColor.Green
    )
  }

  public async getUserByUsername(username: string): Promise<UserEntity | null> {
    const resultSet = await this.searchUsername(username)
    if (resultSet.rows.length === 0) return null
    const row = resultSet.rows[0]
    return await this.mapUser(row)
  }

  public async getUserByUserId(userId: string): Promise<UserEntity | null> {
    const resultSet = await this.searchUserId(userId)
    if (resultSet.rows.length === 0) return null
    const row = resultSet.rows[0]
    return await this.mapUser(row)
  }

  public async deleteUserByUsername(username: string): Promise<void> {
    const resultSet = await this.searchUsername(username)
    if (resultSet.rows.length === 0) {
      throw new Error('User not found')
    }
    const row = resultSet.rows[0]
    await tursoClient.execute({
      sql: 'DELETE FROM users WHERE id = :userId',
      args: {
        userId: row?.id as string
      }
    })
    await tursoClient.execute({
      sql: 'DELETE FROM token_table WHERE id = :tokenId',
      args: {
        tokenId: row?.token_reference as string
      }
    })
    Server.log(`User ${username} deleted`, LogColor.Yellow)
  }

  private async searchUsername(username: string): Promise<ResultSet> {
    const resultSet = await tursoClient.execute({
      sql: 'SELECT * FROM users WHERE username = :username',
      args: {
        username
      }
    })
    return resultSet
  }

  private async searchUserId(userId: string): Promise<ResultSet> {
    const resultSet = await tursoClient.execute({
      sql: 'SELECT * FROM users WHERE id = :userId',
      args: {
        userId
      }
    })
    return resultSet
  }

  private async checkUsernameExists(username: string): Promise<boolean> {
    const resultSet = await this.searchUsername(username)
    return resultSet.rows.length > 0
  }

  private async getTokenById(tokenId: string): Promise<TokenEntity> {
    const resultSet = await tursoClient.execute({
      sql: 'SELECT id, token_name, token_value FROM token_table WHERE id = :tokenId',
      args: {
        tokenId
      }
    })
    if (resultSet.rows.length === 0) {
      throw new Error('Token not found')
    }
    const row = resultSet.rows[0]
    if (row !== undefined) {
      return {
        id: row.id as string,
        token_name: row.token_name as string,
        token_value: row.token_value as string
      }
    } else {
      throw new Error('Token not found')
    }
  }

  private async mapUser(row: any): Promise<UserEntity> {
    const tokenValue = await this.getTokenById(row.token_reference as string)
    return new User(
      row.id as string,
      row.username as string,
      row.email as string,
      row.password as string,
      row.role as UserRole,
      tokenValue,
      row.endpoint as string,
      row.tierAccount as TierAccount
    )
  }

  public async oauthGoogle(code: string): Promise<void> {
    // Implementar
  }
}
