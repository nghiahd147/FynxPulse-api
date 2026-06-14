import express from 'express'
import { config } from 'dotenv'
import userRouter from './routes/users.routes'
import hashTagRouter from './routes/hashtags.routes'
import postRouter from './routes/posts.routes'
import commentRouter from './routes/comments.routes'
import mediaRouter from './routes/media.routes'
import staticRouter from './routes/static.routes'
import databaseServices from './services/database.services'
import cors from 'cors'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import { initFolder } from './utils/file'

config()
databaseServices.connect()
initFolder()

const app = express()
const port = process.env.PORT || 5000

app.use(express.json())
app.use(cors())

app.use('/api/user', userRouter)
app.use('/api/hashtag', hashTagRouter)
app.use('/api/post', postRouter)
app.use('/api/comment', commentRouter)
app.use('/api/media', mediaRouter)
app.use('/static', staticRouter)

app.use(defaultErrorHandler)
app.listen(port, () => {
  console.log(`Server is running http://localhost:${port}`)
})
