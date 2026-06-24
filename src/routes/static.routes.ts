import express from 'express'
import { serveHLSStreamController, serveImageController, serveVideoStreamController } from '~/controllers/static.controller'

const routes = express.Router()

routes.get('/images/:name', serveImageController)
routes.get('/videos-stream/:name', serveVideoStreamController)
routes.get('/hls-stream/:id', serveHLSStreamController)

export default routes