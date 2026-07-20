import { Router } from 'express'
import {
  createBookMarkController,
  deleteBookMarkController,
  getStatusBookMarkController
} from '~/controllers/bookmarks.controller'
import { postIdValidator } from '~/middlewares/posts.middlewares'
import { accessTokenValidator, verifiedEmailValidator } from '~/middlewares/users.middlewares'
import { wrapHandlers } from '~/utils/handlers'

const routes = Router()

routes.post('/', accessTokenValidator, verifiedEmailValidator, wrapHandlers(createBookMarkController))
routes.get('/status/:post_id', accessTokenValidator, verifiedEmailValidator, wrapHandlers(getStatusBookMarkController))
routes.delete(
  '/post/:post_id',
  accessTokenValidator,
  verifiedEmailValidator,
  postIdValidator,
  wrapHandlers(deleteBookMarkController)
)

export default routes
