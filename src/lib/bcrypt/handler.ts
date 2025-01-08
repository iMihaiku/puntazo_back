import bcrypt from 'bcrypt'

async function encrypt(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

async function compare(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export {
  encrypt,
  compare
}