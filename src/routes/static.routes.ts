import express from 'express'
import { serveImageController, serveVideoController } from '~/controllers/static.controller'

const routes = express.Router()

routes.get('/images/:name', serveImageController)
routes.get('/videos/:name', serveVideoController)

export default routes