import express from 'express'
import {
  getAllPostsController,
  createPostController,
  getPostDetail,
  deletePostController,
  getPostsByAuthorIdController,
  reactionPostController
} from '~/controllers/posts.controller'
import { createPostValidator, reactionPostValidator } from '~/middlewares/posts.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapHandlers } from '~/utils/handlers'

const routes = express.Router()

routes.get('/', accessTokenValidator, wrapHandlers(getAllPostsController))
routes.get('/:author_id', accessTokenValidator, wrapHandlers(getPostsByAuthorIdController))
routes.post('/', accessTokenValidator, createPostValidator, wrapHandlers(createPostController))
routes.get('/:id', accessTokenValidator, wrapHandlers(getPostDetail))
routes.delete('/:id', accessTokenValidator, wrapHandlers(deletePostController))
routes.post('/reaction', accessTokenValidator, reactionPostValidator, wrapHandlers(reactionPostController))

export default routes
