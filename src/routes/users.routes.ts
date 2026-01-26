import express from 'express'
import { getUsersController, getDetailUserController, registerController } from '~/controllers/users.controllers'

const userRouter = express.Router()

userRouter.get('/', getUsersController)
userRouter.get('/:userId', getDetailUserController)
userRouter.post('/register', registerController)

export default userRouter
