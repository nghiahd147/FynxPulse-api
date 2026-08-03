import express from 'express'
import {
  getAllPostsController,
  createPostController,
  getPostDetailController,
  deletePostController,
  getPostsByAuthorIdController,
  getCommentChildrenController,
  getPostChildrenController
} from '~/controllers/posts.controller'
import {
  audienceValidator,
  createPostValidator,
  getPostChildrenValidator,
  isUserLoggedValidator,
  paginationValidator,
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
  '/:post_id/children-comment',
  postIdValidator,
  getPostChildrenValidator,
  paginationValidator,
  isUserLoggedValidator(accessTokenValidator),
  isUserLoggedValidator(verifiedEmailValidator),
  audienceValidator,
  wrapHandlers(getCommentChildrenController)
)
routes.get(
  '/:post_id/children-post',
  postIdValidator,
  getPostChildrenValidator,
  paginationValidator,
  isUserLoggedValidator(accessTokenValidator),
  isUserLoggedValidator(verifiedEmailValidator),
  audienceValidator,
  wrapHandlers(getPostChildrenController)
)
routes.get(
  '/author/:author_id',
  paginationValidator,
  accessTokenValidator,
  verifiedEmailValidator,
  wrapHandlers(getPostsByAuthorIdController)
)
routes.post('/', accessTokenValidator, createPostValidator, wrapHandlers(createPostController))
routes.delete('/:post_id', accessTokenValidator, postIdValidator, wrapHandlers(deletePostController))

export default routes
