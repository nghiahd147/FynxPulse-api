import express from 'express'
import {
  getAllPostsController,
  createPostController,
  getPostDetail,
  deletePostController,
  getPostsByAuthorIdController
} from '~/controllers/posts.controller'
import { createPostValidator, isUserLoggedValidator, postIdValidator } from '~/middlewares/posts.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapHandlers } from '~/utils/handlers'

const routes = express.Router()

routes.get('/', accessTokenValidator, wrapHandlers(getAllPostsController))
routes.get('/:author_id', accessTokenValidator, wrapHandlers(getPostsByAuthorIdController))
routes.post('/', accessTokenValidator, createPostValidator, wrapHandlers(createPostController))
routes.get(
  '/:id',
  isUserLoggedValidator(accessTokenValidator),
  isUserLoggedValidator(postIdValidator),
  wrapHandlers(getPostDetail)
)
routes.delete('/:post_id', accessTokenValidator, postIdValidator, wrapHandlers(deletePostController))

export default routes
