import { Router } from 'express'
import { getConversationController } from '~/controllers/conversations.controller'
import { accessTokenValidator, verifiedEmailValidator } from '~/middlewares/users.middlewares'
import { wrapHandlers } from '~/utils/handlers'

const routes = Router()

routes.get(
  '/receiver/:receiver_id',
  accessTokenValidator,
  // verifiedEmailValidator,
  wrapHandlers(getConversationController)
)

export default routes
