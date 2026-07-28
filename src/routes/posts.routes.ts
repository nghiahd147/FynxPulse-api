import express from 'express'
import {
  getAllPostsController,
  createPostController,
  getPostDetailController,
  deletePostController,
  getPostsByAuthorIdController,
  getCommentPostChildrenController
} from '~/controllers/posts.controller'
import {
  audienceValidator,
  createPostValidator,
  isUserLoggedValidator,
  postIdValidator
} from '~/middlewares/posts.middlewares'
import { accessTokenValidator, verifiedEmailValidator } from '~/middlewares/users.middlewares'
import { wrapHandlers } from '~/utils/handlers'

const routes = express.Router()

routes.get('/', accessTokenValidator, wrapHandlers(getAllPostsController))
routes.get(
  '/:post_id',
  postIdValidator,
  isUserLoggedValidator(accessTokenValidator),
  isUserLoggedValidator(verifiedEmailValidator),
  audienceValidator,
  wrapHandlers(getPostDetailController)
)
routes.get(
  '/:post_id/children',
  postIdValidator,
  isUserLoggedValidator(accessTokenValidator),
  isUserLoggedValidator(verifiedEmailValidator),
  audienceValidator,
  wrapHandlers(getCommentPostChildrenController)
)
routes.get(
  '/author/:author_id',
  accessTokenValidator,
  verifiedEmailValidator,
  wrapHandlers(getPostsByAuthorIdController)
)
routes.post('/', accessTokenValidator, createPostValidator, wrapHandlers(createPostController))
routes.delete('/:post_id', accessTokenValidator, postIdValidator, wrapHandlers(deletePostController))

export default routes
