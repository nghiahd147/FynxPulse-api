import express from 'express'
import { uploadSingleImageController } from '~/controllers/media.controller'
import { wrapHandlers } from '~/utils/handlers'

const routes = express.Router()

routes.post('/upload-image', wrapHandlers(uploadSingleImageController))

export default routes
