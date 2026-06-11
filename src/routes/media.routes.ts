import express from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/media.controller'
import { accessTokenValidator, verifiedEmailValidator } from '~/middlewares/users.middlewares'
import { wrapHandlers } from '~/utils/handlers'

const routes = express.Router()

routes.post('/upload-image', accessTokenValidator, verifiedEmailValidator, wrapHandlers(uploadImageController))
routes.post('/upload-video', accessTokenValidator, verifiedEmailValidator, wrapHandlers(uploadVideoController))

export default routes
