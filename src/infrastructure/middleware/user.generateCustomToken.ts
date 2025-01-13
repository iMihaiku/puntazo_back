import { type Request, type Response, type NextFunction } from 'express'
import { type TokenEntity } from '@/domain/user/entity'
import { nanoid } from 'nanoid'

export default function generateCustomToken(
  req: Request,
  res: Response,
  next: NextFunction
): any {
  const tokenId = nanoid(10)
  const tokenValue = nanoid(41)
  const tokenInfo: TokenEntity = {
    id: tokenId,
    token_name: 'custom_token_access',
    token_value: tokenValue
  }
  req.authInfo = {
    token: tokenInfo
  }
  next()
}
