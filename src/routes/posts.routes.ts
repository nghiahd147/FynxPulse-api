import express from 'express'
import { getAllPostsController, createPostController } from '~/controllers/posts.controller'
import { createPostValidator } from '~/middlewares/posts.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapHandlers } from '~/utils/handlers'

const routes = express.Router()

routes.get('/', accessTokenValidator, wrapHandlers(getAllPostsController))
routes.post('/', accessTokenValidator, createPostValidator, wrapHandlers(createPostController))

export default routes
