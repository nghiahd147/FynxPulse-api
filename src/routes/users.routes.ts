import express from 'express'
import { usersValidation } from '~/middlewares/users.middlewares'

const userRouter = express.Router()

userRouter.get('/', usersValidation, (req, res) => {
  res.send('user')
})

export default userRouter
