import express from 'express'
import { getAllPostsController, createPostController, getPostDetail } from '~/controllers/posts.controller'
import { createPostValidator } from '~/middlewares/posts.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapHandlers } from '~/utils/handlers'

const routes = express.Router()

routes.get('/', accessTokenValidator, wrapHandlers(getAllPostsController))
routes.post('/', accessTokenValidator, createPostValidator, wrapHandlers(createPostController))
routes.get('/:id', accessTokenValidator, wrapHandlers(getPostDetail))

export default routes
