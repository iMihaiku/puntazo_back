/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { generateJWT } from '@/lib/jwt'
import { type Request, type Response, type NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UserCases } from '@/app/user/cases'
import { SQLRepository } from '@/infrastructure/user/repository/sql'
import { UserTokenController } from '../user/controller/user_token_controller'

export default async function jwtValidation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  // 1. Recuperamos el user_id del jwt
  // 2. Buscamos su access token asociado
  // 3. Verificamos que sigue siendo valido
  // 3a. Si es valido generamos un nuevo jwt y lo devolvemos
  // 3b. Si no es valido borramos la cookie y respondemos que no esta logueado.

  const { JWT_SECRET } = process.env
  if (JWT_SECRET === undefined) {
    return res.status(500).json({ message: 'Internal server error' })
  }
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  const token = authHeader.split(' ')[1]!
  const userData = jwt.decode(token, { complete: true })
  if (
    typeof userData?.payload === 'string' ||
    !userData?.payload.id ||
    !userData?.payload.name ||
    !userData?.payload.email
  ) {
    return res.status(401).json({ message: 'Unauthorized Bad Format' })
  }
  try {
    jwt.verify(token, JWT_SECRET)
  } catch (error) {
    const userRepo = new SQLRepository()
    const userCases = new UserCases(userRepo)
    const userTokenController = new UserTokenController(userCases)
    if ((error as Error).name === 'TokenExpiredError') {
      const isValid = await userTokenController.validateToken(
        userData?.payload.id
      )
      if (isValid) {
        const newToken = generateJWT(
          userData?.payload.id,
          userData?.payload.name,
          userData?.payload.email
        )
        res.cookie('session_token', newToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000
        })
      } else {
        res.clearCookie('access_token')
        return res.status(401).json({ message: 'Unauthorized' })
      }
    } else {
      return res.status(401).json({ message: 'Unauthorized' })
    }
  }

  next()
}
