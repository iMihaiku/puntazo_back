import { Server, LogColor } from '@/lib/server.logs'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { type Request, type Response, type NextFunction } from 'express'

export default function tokenValidation(
  req: Request,
  res: Response,
  next: NextFunction
): any {
  const authToken = req.headers.authorization
  if (!authToken) {
    return res.status(401).json({ message: 'Token must be provided to access' })
  }
  const token = authToken.split(' ')[1]
  if (!token) {
    return res
      .status(401)
      .json({ message: 'Token may be Bearer and must be provided' })
  }
  if (!process.env.JWT_SECRET) {
    Server.log('JWT_SECRET not found', LogColor.Red)
    return res.status(500).json({ message: 'Bad server configuration' })
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, authInfo) => {
    if (err) {
      Server.log('The supplied token is not valid', LogColor.Red)
      return res
        .status(403)
        .json({ message: 'The supplied token is not valid' })
    }
    const userId: string | undefined = (authInfo as JwtPayload).userId
    const role: string | undefined = (authInfo as JwtPayload).role

    if (!userId) {
      return res.status(403).json({ message: 'Invalid token payload' })
    }
    req.authInfo = { userId, role }

    next()
  })
}
