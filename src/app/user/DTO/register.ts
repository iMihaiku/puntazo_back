export class UserRegisterDTO {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly email: string,
    public readonly role: string
  ) {}
}
