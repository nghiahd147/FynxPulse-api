import express, { NextFunction, Request, Response } from 'express'
import dotenv from 'dotenv'
import userRouter from './routes/users.routes'
import hashTagRouter from './routes/hashtags.routes'
import databaseServices from './services/database.services'
import cors from 'cors'
import { defaultErrorHandler } from './middlewares/error.middlewares'

dotenv.config()
databaseServices.connect()

const app = express()
const port = process.env.PORT || 5000

app.use(express.json())
app.use(cors())

app.use('/api/user', userRouter)
app.use('/api/hashtag', hashTagRouter)

app.use(defaultErrorHandler)
app.listen(port, () => {
  console.log(`Server is running http://localhost:${port}`)
})
