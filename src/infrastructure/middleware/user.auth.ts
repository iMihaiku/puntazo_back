import { type Request, type Response, type NextFunction } from 'express'
import { UserRole } from '@/domain/user/value'

export default function authValidation(
  req: Request,
  res: Response,
  next: NextFunction
): any {
  const { userId, role } = req.authInfo
  if (!userId && !role) {
    return res.status(403).json({ message: 'Invalid token payload' })
  }
  const isAdmin = role === UserRole.ADMIN
  if (userId !== req.params.userId && !isAdmin) {
    return res
      .status(403)
      .json({ message: 'You are not authorized to access this resource' })
  }
  next()
}
