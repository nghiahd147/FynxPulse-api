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
import conversationRouter from './routes/conversations.routes'
import cors from 'cors'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import { initFolder } from './utils/file'
import searchRouter from './routes/search.routes'
import { createServer } from 'http'
import { Server } from 'socket.io'
import Conversations from './models/schemas/Conversations.schema'
import { ObjectId } from 'mongodb'
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
app.use('/api/conversations', conversationRouter)
app.use('/static', staticRouter)

app.use(defaultErrorHandler)

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173'
  }
})

const users: {
  [key: string]: {
    socket_id: string
  }
} = {}

io.on('connection', (socket) => {
  console.log('log', socket.handshake.auth.user_id)
  const user_id = socket.handshake.auth.user_id
  users[user_id] = {
    socket_id: socket.id
  }
  console.log('connect', socket.id)

  socket.on('send_message', async (data: { content: string; receiver_id: string; sender_id: string }) => {
    const receive_user_id = users[data.receiver_id]?.socket_id
    // if (!receive_user_id) {
    //   return
    // }
    const result = await databaseServices.conversations().insertOne(
      new Conversations({
        sender_id: new ObjectId(data.sender_id),
        receiver_id: new ObjectId(data.receiver_id),
        content: data.content as string
      })
    )
    const conversation_id = result.insertedId
    socket.to(receive_user_id).emit('receiver_message', {
      content: data.content,
      sender_id: data.sender_id,
      receiver_id: data.receiver_id,
      _id: conversation_id
    })
  })

  socket.on('disconnect', () => {
    delete users[user_id]
    console.log(`User ${socket.id} disconnected`)
  })
})

httpServer.listen(port, () => {
  console.log(`Server is running http://localhost:${port}`)
})
