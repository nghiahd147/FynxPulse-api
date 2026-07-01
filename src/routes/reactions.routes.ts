import express from 'express'
import {
  getAllReactionsController,
  getReactionsByPostIdController,
  reactionPostController,
  unReactionPostController
} from '~/controllers/reactions.controller'
import { reactionPostValidator, unReactionPostValidator } from '~/middlewares/reactions.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapHandlers } from '~/utils/handlers'

const routes = express.Router()

routes.get('/', accessTokenValidator, wrapHandlers(getAllReactionsController))
routes.post('/', accessTokenValidator, reactionPostValidator, wrapHandlers(reactionPostController))
routes.delete('/', accessTokenValidator, unReactionPostValidator, wrapHandlers(unReactionPostController))
routes.get('/post/:post_id', accessTokenValidator, wrapHandlers(getReactionsByPostIdController))

export default routes
