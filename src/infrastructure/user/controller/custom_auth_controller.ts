import { type UserCases } from '@/app/user/cases'
import { type TokenEntity } from '@/domain/user/entity'
import { generateJWT } from '@/lib/jwt'
import { type Request, type Response } from 'express'
import { nanoid } from 'nanoid'

const { AUTH_RESPONSE_URL } = process.env

let DOMAIN_URI: string

switch (process.env.NODE_ENV) {
  case 'production':
    DOMAIN_URI = process.env.DOMAIN_URI_PRO!
    break
  case 'preproduction':
    DOMAIN_URI = process.env.DOMAIN_URI_PRE!
    break
  case 'development':
  default:
    DOMAIN_URI = process.env.DOMAIN_URI_DEV!
    break
}

export async function customRegisterUser(
  req: Request,
  res: Response,
  userCases: UserCases
): Promise<void> {
  const { name, lastName, email, password } = req.body as unknown as {
    name: string
    lastName: string
    email: string
    password: string
  }
  if (name === undefined || email === undefined || password === undefined) {
    res.status(401).send('Missing parameters or incorrect parameters')
  } else {
    const token: TokenEntity = {
      id: '',
      token_name: 'custom_token_access',
      token_value: 'not_needed'
    }
    const username = `${name} ${lastName}`
    try {
      const userCreate = await userCases.createUser(
        username,
        email,
        password,
        token
      )
      if (userCreate === null) {
        res.status(409).send(
          `Error al crear el usuario, si esto persiste por favor pongase
            en conctacto con el soporte de la pagina.`
        )
        return
      }
      const sessionId = nanoid(15)
      await userCases.updateSession(userCreate.id, sessionId)
      const jwtToken = generateJWT(userCreate.id, username, email, sessionId)
      res.cookie('session_token', jwtToken, {
        httpOnly: true,
        secure: true,
        maxAge: 3600 * 1000 * 4
      })
      console.log('User created custom auth', res)
      res.json({ url: `${DOMAIN_URI}${AUTH_RESPONSE_URL}?state=succeded` })
    } catch (error: any) {
      res.status(500).send(error.message)
      res.json({ url: `${DOMAIN_URI}${AUTH_RESPONSE_URL}?state=succeded` })
    }
  }
}

export async function customLoginUser(
  req: Request,
  res: Response,
  userCases: UserCases
): Promise<void> {
  const { email, password } = req.body as {
    email: string
    password: string
  }
  if (email === undefined || password === undefined) {
    res.status(400).send('Missing parameters or incorrect parameters')
    return
  }
  const user = await userCases.loginUser(email, password)
  if (user === null) {
    res.status(401).send('Las credenciales proporcionadas no son validas')
    return
  }
  const sessionId = nanoid(15)
  const jwtToken = generateJWT(user.id, user.username, email, sessionId)
  res.cookie('session_token', jwtToken, {
    httpOnly: true,
    secure: true,
    maxAge: 3600 * 1000
  })
  res.json({ url: `${DOMAIN_URI}${AUTH_RESPONSE_URL}?state=succeded` })
}

export async function verifySession(
  req: Request,
  res: Response,
  userCases: UserCases
): Promise<void> {
  let {
    userId,
    sessionId,
    email,
    name
  }: {
    userId: string
    sessionId: string
    email: string
    name: string
  } = req.authInfo
  const role = undefined // temporal hasta implementacion
  const isValid = await userCases.verifySession(userId, sessionId)
  if (!isValid) {
    email = ''
    name = ''
    userId = ''
  }
  res.json({ isValid, email, name, userId, role })
}
