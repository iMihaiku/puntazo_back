import jwt from 'jsonwebtoken'

function generateJWT(id: string, name: string, email: string): string {
  const { JWT_SECRET } = process.env
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no está definido')
  }
  const jwtToken = jwt.sign(
    {
      id,
      name,
      email
    },
    JWT_SECRET,
    { expiresIn: '12s' }
  )
  return jwtToken
}

export { generateJWT }
