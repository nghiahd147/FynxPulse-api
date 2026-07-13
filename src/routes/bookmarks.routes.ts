import { Router } from 'express'
import { createBookMarkController, deleteBookMarkController } from '~/controllers/bookmarks.controller'
import { accessTokenValidator, verifiedEmailValidator } from '~/middlewares/users.middlewares'
import { wrapHandlers } from '~/utils/handlers'

const routes = Router()

routes.post('/', accessTokenValidator, verifiedEmailValidator, wrapHandlers(createBookMarkController))
routes.delete('/post/:post_id', accessTokenValidator, verifiedEmailValidator, wrapHandlers(deleteBookMarkController))

export default routes
