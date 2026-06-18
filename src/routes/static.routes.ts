import express from 'express'
import { serveImageController, serveVideoStreamController } from '~/controllers/static.controller'

const routes = express.Router()

routes.get('/images/:name', serveImageController)
routes.get('/videos-stream/:name', serveVideoStreamController)

export default routes