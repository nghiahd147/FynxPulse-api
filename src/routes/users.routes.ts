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
  logoutController
} from '~/controllers/users.controller'
import {
  accessTokenValidation,
  loginValidation,
  refreshTokenValidation,
  registerValidation
} from '~/middlewares/users.middlewares'
import { wrapHandlers } from '~/utils/handlers'

const userRouter = express.Router()

userRouter.get('/', wrapHandlers(getUsersController))
userRouter.get('/:userId', getDetailUserController)
userRouter.patch('/:userId/ban', bandUserController)
userRouter.patch('/:userId/unban', unBandUserController)
userRouter.patch('/:userId/role', switchRoleUserController)
userRouter.delete('/:userId', deleteUserController)
userRouter.post('/register', registerValidation, wrapHandlers(registerController))
userRouter.post('/login', loginValidation, wrapHandlers(loginController))
userRouter.post('/logout', accessTokenValidation, refreshTokenValidation, wrapHandlers(logoutController))

export default userRouter
