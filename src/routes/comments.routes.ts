import express from 'express'
import {
  getCommentsController,
  getCommentDetailController,
  createCommentController,
  deleteCommentController
} from '~/controllers/comment.controller'
import { createCommentValidator } from '~/middlewares/comment.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapHandlers } from '~/utils/handlers'

const routes = express.Router()

routes.get('/', accessTokenValidator, wrapHandlers(getCommentsController))
routes.get('/:id', accessTokenValidator, wrapHandlers(getCommentDetailController))
routes.post('/', createCommentValidator, accessTokenValidator, wrapHandlers(createCommentController))
routes.delete('/:id', accessTokenValidator, wrapHandlers(deleteCommentController))

export default routes
