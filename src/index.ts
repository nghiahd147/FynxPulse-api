import { envConfig, isProduction } from './constants/config'
import express from 'express'
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
import cors, { CorsOptions } from 'cors'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import { initFolder } from './utils/file'
import searchRouter from './routes/search.routes'
import { createServer } from 'http'
import initSocket from './utils/socket'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'

// import './utils/fake'

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
const port = envConfig.PORT || 5000

const corsOptions: CorsOptions = {
  origin: isProduction ? envConfig.CLIENT_URL : '*'
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56
})

app.use(express.json())
app.use(helmet())
app.use(limiter)
app.use(cors(corsOptions))

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

initSocket(httpServer)

httpServer.listen(port, () => {
  console.log(`Server is running http://localhost:${port}`)
})
