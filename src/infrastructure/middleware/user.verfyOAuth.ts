import { type Request, type Response, type NextFunction } from 'express'

const verifyOAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const token = req.cookies.access_token
  if (!token) {
    return res.status(401).send('No token provided')
  }
  try {
    const responseAPI = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await responseAPI.json()
    req.authInfo.access_token_data = data
    next()
  } catch (error: any) {
    return res.status(401).json({ message: 'Invalid token', error })
  }
}
export default verifyOAuth
