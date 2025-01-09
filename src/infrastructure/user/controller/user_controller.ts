import { type UserCases } from '@/app/user/cases'
import { type TokenEntity } from '@/domain/user/entity'
import { type Request, type Response } from 'express'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'

const DOMAIN_URI = 'http://localhost:8080'
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env

const oauth2Client = new OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  DOMAIN_URI + REDIRECT_URI
)
const oauth2 = google.oauth2('v2')

export class UserController {
  constructor(private readonly userCases: UserCases) {
    this.registerUser = this.registerUser.bind(this)
    this.getUserByUsername = this.getUserByUsername.bind(this)
    this.getUserByUserId = this.getUserByUserId.bind(this)
    this.loginUser = this.loginUser.bind(this)
    this.oauthGoogle = this.oauthGoogle.bind(this)
    this.callbackOAuthGoogle = this.callbackOAuthGoogle.bind(this)
  }

  public async registerUser(req: Request, res: Response): Promise<void> {
    const { username, email, password } = req.body as {
      username: string
      email: string
      password: string
    }
    const { token }: { token: TokenEntity } = req.authInfo
    try {
      await this.userCases.createUser(username, email, password, token)
      res.status(201).send(`User ${username} created`)
    } catch (error: any) {
      res.status(400).send(error.message)
    }
  }

  public async getUserByUsername(req: Request, res: Response): Promise<void> {
    const { username } = req.params
    if (username === undefined) {
      res.status(401).send('No se recupero un username')
    }
    const user = await this.userCases.getUserByUsername(username!)
    if (user === null) {
      res.status(404).send('User not found')
      return
    }
    res.status(200).send(user)
  }

  public async getUserByUserId(req: Request, res: Response): Promise<void> {
    const { userId } = req.params
    if (userId === undefined) {
      res.status(401).send('No se recupero un user id')
    }
    const user = await this.userCases.getUserByUserId(userId!)
    if (user === null) {
      res.status(404).send('Usuario no encontrado')
      return
    }
    res.status(200).send(user)
  }

  public async loginUser(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body as {
      username: string
      password: string
    }
    const user = await this.userCases.loginUser(username, password)
    if (user === null) {
      res.status(401).send('Las credenciales proporcionadas no son validas')
      return
    }
    res.status(200).send(user)
  }

  public async oauthGoogle(req: Request, res: Response): Promise<void> {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    })
    res.redirect(authUrl)
  }

  public async callbackOAuthGoogle(req: Request, res: Response): Promise<void> {
    const code = req.query.code?.toString() ?? ''

    try {
      const { tokens } = await oauth2Client.getToken(code)
      oauth2Client.setCredentials(tokens)
      const userInfo = await oauth2.userinfo.get({ auth: oauth2Client })
      const userData = userInfo.data
      /**
       * Check if the user is already registered
       */
      const registeredUserData = await this.userCases.getUserByUserId(
        userData.id!
      )
      /**
       * Saving the refresh token and user data in the database
       */
      if (!registeredUserData) {
        await this.userCases.callbackOAuthGoogle(userData, tokens.refresh_token!)
      }
      /**
       * Obtaining user information
       */
      res.cookie('access_token', tokens.access_token, {
        httpOnly: true,
        secure: true,
        maxAge: 3600 * 1000
      })
      res.json({
        success: true,
        user: userData
      })
    } catch (err) {
      console.error(err)
      res.status(500).send('Error al autenticar')
    }
  }
}
