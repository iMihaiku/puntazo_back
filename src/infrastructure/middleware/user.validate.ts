/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Server, LogColor } from '@/lib/server.logs'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { type Request, type Response, type NextFunction } from 'express'

export default function tokenValidation(
  req: Request,
  res: Response,
  next: NextFunction
): any {
  const authHeaderToken = req.headers.authorization
  const authCookieToken = req.cookies.session_token
  const authToken = authCookieToken ?? authHeaderToken

  if (!authToken) {
    return res.status(401).json({ message: 'Token must be provided to access' })
  }
  let token = authToken.split(' ')[1]
  if (!token && authHeaderToken !== undefined) {
    return res
      .status(401)
      .json({ message: 'Token may be Bearer and must be provided' })
  } else {
    token = authToken
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
    console.log(authInfo)
    const userId: string | undefined = (authInfo as JwtPayload).id
    const role: string | undefined = (authInfo as JwtPayload).role
    const sessionId: string | undefined = (authInfo as JwtPayload).sessionId
    const name: string | undefined = (authInfo as JwtPayload).name
    const email: string | undefined = (authInfo as JwtPayload).email

    if (!userId || !sessionId) {
      return res.status(403).json({ message: 'Invalid token payload' })
    }
    req.authInfo = { userId, sessionId, role, name, email }

    next()
  })
}
