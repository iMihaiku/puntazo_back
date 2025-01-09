import { type TokenEntity } from '@/domain/user/entity'

export class UserLoginDTO {
  constructor(
    public readonly id: string,
    public readonly tokenJWT: string,
    public readonly role: string,
    public readonly token: TokenEntity,
    public readonly tierAccount: string
  ) {}
}
