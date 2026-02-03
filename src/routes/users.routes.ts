import express from 'express'
import {
  getUsersController,
  getDetailUserController,
  registerController,
  bandUserController,
  unBandUserController,
  switchRoleUserController,
  deleteUserController
} from '~/controllers/users.controller'
import { registerValidation } from '~/middlewares/users.middlewares'

const userRouter = express.Router()

userRouter.get('/', getUsersController)
userRouter.get('/:userId', getDetailUserController)
userRouter.patch('/:userId/ban', bandUserController)
userRouter.patch('/:userId/unban', unBandUserController)
userRouter.patch('/:userId/role', switchRoleUserController)
userRouter.delete('/:userId', deleteUserController)
userRouter.post('/register', registerValidation, registerController)

export default userRouter
