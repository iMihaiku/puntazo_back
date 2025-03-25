/* eslint-disable @typescript-eslint/return-await */
import bcrypt from 'bcrypt'

async function encrypt(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

async function compare(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export { encrypt, compare }
