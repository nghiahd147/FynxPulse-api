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

userRouter.get('/', wrapHandlers(getUsersController))
userRouter.get('/:userId', getDetailUserController)
userRouter.patch('/:userId/ban', bandUserController)
userRouter.patch('/:userId/unban', unBandUserController)
userRouter.patch('/:userId/role', switchRoleUserController)
userRouter.delete('/:userId', deleteUserController)
userRouter.post('/register', registerValidator, wrapHandlers(registerController))
userRouter.post('/login', loginValidator, wrapHandlers(loginController))
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapHandlers(logoutController))
userRouter.post('/email-verify', emailVerifyValidator, wrapHandlers(emailVerifyController))

export default userRouter
