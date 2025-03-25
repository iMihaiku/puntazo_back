/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import { UserCases } from '@/app/user/cases'
import { UserController } from '@/infrastructure/user/controller/user_controller'
import { SQLRepository } from '@/infrastructure/user/repository/sql'
// import verifyOAuth from '@/infrastructure/middleware/user.verfyOAuth'
import tokenValidation from '@/infrastructure/middleware/user.validate'
import authValidation from '@/infrastructure/middleware/user.auth'
// import jwtValidation from '@/infrastructure/middleware/token.validate'

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

const userRouter = Router()

const userRepo = new SQLRepository()
const userCases = new UserCases(userRepo)
const userController = new UserController(userCases)

userRouter.post('/register', userController.registerUser)
userRouter.post('/login', userController.loginUser)
userRouter.delete('/', userController.deleteUserByUsername)

userRouter.get('/oauth/google', userController.oauthGoogle)
userRouter.get('/oauth2callback/google', userController.callbackOAuthGoogle)

userRouter.get('/test', async (req, res) => {
  res.json({ url: `${DOMAIN_URI}${AUTH_RESPONSE_URL}?state=succeded` })
})

userRouter.get('/oauth/facebook', userController.oauthFacebook)
userRouter.get('/oauth2callback/facebook', userController.callbackOAuthFacebook)

userRouter.get(
  '/:userId',
  tokenValidation,
  authValidation,
  userController.getUserByUserId
)

export default userRouter
