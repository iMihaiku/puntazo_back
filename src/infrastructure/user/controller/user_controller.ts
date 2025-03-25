import { BodyResponseDTO } from '@/app/response/DTO/body'
import { type UserCases } from '@/app/user/cases'
// import { generateJWT } from '@/lib/jwt'
import { type Request, type Response } from 'express'
import { callbackOAuthGoogle, oauthGoogle } from './google_oauth_controller'
import {
  callbackOAuthFacebook,
  oauthFacebook
} from './facebook_oauth_controller'
import { customLoginUser, customRegisterUser } from './custom_auth_controller'
export class UserController {
  constructor(private readonly userCases: UserCases) {
    this.registerUser = this.registerUser.bind(this)
    this.getUserByUsername = this.getUserByUsername.bind(this)
    this.getUserByUserId = this.getUserByUserId.bind(this)
    this.loginUser = this.loginUser.bind(this)
    this.oauthGoogle = this.oauthGoogle.bind(this)
    this.callbackOAuthGoogle = this.callbackOAuthGoogle.bind(this)
    this.callbackOAuthFacebook = this.callbackOAuthFacebook.bind(this)
    this.deleteUserByUsername = this.deleteUserByUsername.bind(this)
  }

  public async registerUser(req: Request, res: Response): Promise<void> {
    await customRegisterUser(req, res, this.userCases)
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
    await customLoginUser(req, res, this.userCases)
  }

  public async oauthGoogle(req: Request, res: Response): Promise<void> {
    await oauthGoogle(req, res)
  }

  public async callbackOAuthGoogle(req: Request, res: Response): Promise<void> {
    await callbackOAuthGoogle(req, res, this.userCases)
  }

  public async oauthFacebook(req: Request, res: Response): Promise<void> {
    await oauthFacebook(req, res)
  }

  public async callbackOAuthFacebook(
    req: Request,
    res: Response
  ): Promise<void> {
    await callbackOAuthFacebook(req, res, this.userCases)
  }

  public async deleteUserByUsername(
    req: Request,
    res: Response
  ): Promise<void> {
    const { userName } = req.query
    const responseDTO: BodyResponseDTO = new BodyResponseDTO()
    if (userName === undefined) {
      responseDTO.code = 401
      responseDTO.message = 'Delete function: Error deleting user'
      responseDTO.data = 'Username must be provided'
    } else {
      try {
        await this.userCases.deleteUserByUsername(userName as string)
        responseDTO.code = 200
        responseDTO.message = 'Delete function: User deleted'
        responseDTO.data = { userName }
      } catch (error: any) {
        responseDTO.code = 400
        responseDTO.message = 'Delete function: Error deleting user'
        responseDTO.data = error.message
      }
    }
    res.status(responseDTO.code).send(responseDTO)
  }
}
