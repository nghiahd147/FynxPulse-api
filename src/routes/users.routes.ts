import express from 'express'
import {
  getUsersController,
  getDetailUserController,
  registerController,
  bandUserController,
  unBandUserController,
  switchRoleUserController,
  deleteUserController,
  loginController,
  logoutController,
  emailVerifyController
} from '~/controllers/users.controller'
import {
  accessTokenValidator,
  emailVerifyValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import { wrapHandlers } from '~/utils/handlers'

const userRouter = express.Router()

userRouter.get('/', accessTokenValidator, wrapHandlers(getUsersController))
userRouter.get('/:userId', accessTokenValidator, getDetailUserController)
userRouter.patch('/:userId/ban', accessTokenValidator, bandUserController)
userRouter.patch('/:userId/unban', accessTokenValidator, unBandUserController)
userRouter.patch('/:userId/role', accessTokenValidator, switchRoleUserController)
userRouter.delete('/:userId', accessTokenValidator, deleteUserController)
userRouter.post('/register', registerValidator, wrapHandlers(registerController))
userRouter.post('/login', loginValidator, wrapHandlers(loginController))
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapHandlers(logoutController))
userRouter.post('/email-verify', emailVerifyValidator, wrapHandlers(emailVerifyController))

export default userRouter
