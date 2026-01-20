import express from 'express'
import { getListUsers, registerController } from '~/controllers/users.controllers'

const userRouter = express.Router()

userRouter.get('/', getListUsers)
userRouter.post('/register', registerController)

export default userRouter
