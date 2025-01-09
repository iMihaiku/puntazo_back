/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import { UserCases } from '@/app/user/cases'
import { UserController } from '@/infrastructure/user/controller/user_controller'
import { SQLRepository } from '@/infrastructure/user/repository/sql'
import verifyOAuth from '@/infrastructure/middleware/user.verfyOAuth'
import tokenValidation from '@/infrastructure/middleware/user.validate'
import authValidation from '@/infrastructure/middleware/user.auth'
import getCustomToken from '@/infrastructure/middleware/user.getCustomToken'

const userRouter = Router()

const userRepo = new SQLRepository()
const userCases = new UserCases(userRepo)
const userController = new UserController(userCases)

userRouter.post('/register', getCustomToken, userController.registerUser)
userRouter.post('/login', userController.loginUser)
userRouter.get('/oauth/test', verifyOAuth, async (req, res) => {
  res.send('OAuth test')
})

userRouter.get('/oauth/google', userController.oauthGoogle)
userRouter.get('/oauth2callback', userController.callbackOAuthGoogle)

userRouter.get(
  '/:userId',
  tokenValidation,
  authValidation,
  userController.getUserByUserId
)

export default userRouter
