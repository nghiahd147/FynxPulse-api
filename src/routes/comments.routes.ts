import express from 'express'
import { createCommentController } from '~/controllers/comment.controller'
import { createCommentValidator } from '~/middlewares/comment.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapHandlers } from '~/utils/handlers'

const routes = express.Router()

routes.post('/', createCommentValidator, accessTokenValidator, wrapHandlers(createCommentController))
