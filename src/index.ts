import express from 'express'
import { config } from 'dotenv'
import userRouter from './routes/users.routes'
import hashTagRouter from './routes/hashtags.routes'
import postRouter from './routes/posts.routes'
import reactionRouter from './routes/reactions.routes'
import commentRouter from './routes/comments.routes'
import bookmarkRouter from './routes/bookmarks.routes'
import mediaRouter from './routes/media.routes'
import staticRouter from './routes/static.routes'
import databaseServices from './services/database.services'
import cors from 'cors'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import { initFolder } from './utils/file'
import searchRouter from './routes/search.routes'
import { createServer } from 'http'
import { Server } from 'socket.io'
// import './utils/fake'

config()
databaseServices.connect().then(() => {
  databaseServices.indexUsers()
  databaseServices.indexRefreshToken()
  databaseServices.indexPost()
  databaseServices.indexComment()
  databaseServices.indexFollowers()
  databaseServices.indexHashTag()
})
initFolder()

const app = express()
const httpServer = createServer(app)
const port = process.env.PORT || 5000

app.use(express.json())
app.use(cors())

app.use('/api/user', userRouter)
app.use('/api/hashtag', hashTagRouter)
app.use('/api/post', postRouter)
app.use('/api/reaction', reactionRouter)
app.use('/api/comment', commentRouter)
app.use('/api/bookmark', bookmarkRouter)
app.use('/api/media', mediaRouter)
app.use('/api/search', searchRouter)
app.use('/static', staticRouter)

app.use(defaultErrorHandler)

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173'
  }
})

io.on('connection', (socket) => {
  console.log(`User ${socket.id} connected`)
  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`)
  })
})

httpServer.listen(port, () => {
  console.log(`Server is running http://localhost:${port}`)
})
