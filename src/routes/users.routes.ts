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
  emailVerifyController,
  forgotPasswordController,
  verifyForgotPasswordController,
  resetPasswordController,
  getMeController
} from '~/controllers/users.controller'
import {
  accessTokenValidator,
  emailVerifyValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  verifyForgotPasswordValidator
} from '~/middlewares/users.middlewares'
import { wrapHandlers } from '~/utils/handlers'

const userRouter = express.Router()

userRouter.get('/', accessTokenValidator, wrapHandlers(getUsersController))
userRouter.get('/me', accessTokenValidator, wrapHandlers(getMeController))
userRouter.get('/:userId', accessTokenValidator, wrapHandlers(getDetailUserController))
userRouter.patch('/:userId/ban', accessTokenValidator, wrapHandlers(bandUserController))
userRouter.patch('/:userId/unban', accessTokenValidator, wrapHandlers(unBandUserController))
userRouter.patch('/:userId/role', accessTokenValidator, wrapHandlers(switchRoleUserController))
userRouter.delete('/:userId', accessTokenValidator, wrapHandlers(deleteUserController))
userRouter.post('/register', registerValidator, wrapHandlers(registerController))
userRouter.post('/login', loginValidator, wrapHandlers(loginController))
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapHandlers(logoutController))
userRouter.post('/email-verify', emailVerifyValidator, wrapHandlers(emailVerifyController))
userRouter.post('/forgot-password', forgotPasswordValidator, wrapHandlers(forgotPasswordController))
userRouter.post('/verify-forgot-password', verifyForgotPasswordValidator, wrapHandlers(verifyForgotPasswordController))
userRouter.post('/reset-password', resetPasswordValidator, wrapHandlers(resetPasswordController))

export default userRouter
