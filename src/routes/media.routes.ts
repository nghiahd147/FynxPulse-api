import express from 'express'
import {
  uploadImageController,
  uploadVideoController,
  uploadVideoHLSController,
  videoStatusController
} from '~/controllers/media.controller'
import { accessTokenValidator, verifiedEmailValidator } from '~/middlewares/users.middlewares'
import { wrapHandlers } from '~/utils/handlers'

const routes = express.Router()

routes.post('/upload-image', accessTokenValidator, verifiedEmailValidator, wrapHandlers(uploadImageController))
routes.post('/upload-video', accessTokenValidator, verifiedEmailValidator, wrapHandlers(uploadVideoController))
routes.post('/upload-video-hls', accessTokenValidator, verifiedEmailValidator, wrapHandlers(uploadVideoHLSController))
routes.get('/get-video-status/:id', accessTokenValidator, verifiedEmailValidator, wrapHandlers(videoStatusController))

export default routes
