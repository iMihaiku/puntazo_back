import { randomBytes, createCipheriv, createDecipheriv } from 'crypto'

const algorithm = 'aes-256-gcm'
const key = process.env.ENCRYPTION_KEY!

export function encrypted(text: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  encrypted += ':::' + iv.toString('hex')
  encrypted += ':::' + cipher.getAuthTag().toString('hex')
  console.log(encrypted)
  return encrypted
}

export function decrypted(encrypted: string): string {
  const iv = encrypted.split(':::')[1]!
  const authTag = encrypted.split(':::')[2]!
  const decipher = createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'))
  decipher.setAuthTag(Buffer.from(authTag, 'hex'))
  let decryptedText = decipher.update(encrypted.split(':::')[0]!, 'hex', 'utf8')
  decryptedText += decipher.final('utf8')
  return decryptedText
}
