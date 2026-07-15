import express from 'express'
import {
  getCommentsController,
  getCommentDetailController,
  createCommentController,
  deleteCommentController,
  getCommentsByPostId
} from '~/controllers/comment.controller'
import { createCommentValidator, getCommentDetailValidator } from '~/middlewares/comment.middlewares'
import { postIdValidator } from '~/middlewares/posts.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapHandlers } from '~/utils/handlers'

const routes = express.Router()

routes.get('/', accessTokenValidator, wrapHandlers(getCommentsController))
routes.get('/:id', accessTokenValidator, getCommentDetailValidator, wrapHandlers(getCommentDetailController))
routes.get('/post/:post_id', accessTokenValidator, postIdValidator, wrapHandlers(getCommentsByPostId))
routes.post('/', accessTokenValidator, createCommentValidator, wrapHandlers(createCommentController))
routes.delete('/:id', accessTokenValidator, wrapHandlers(deleteCommentController))

export default routes
