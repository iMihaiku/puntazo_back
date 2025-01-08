export class UserLoginDTO {
  constructor(
    public readonly id: string,
    public readonly tokenJWT: string,
    public readonly role: string,
    public readonly tokenUsage: number,
    public readonly tierAccount: string
  ) {}
}
