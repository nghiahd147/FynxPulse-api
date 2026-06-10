import express from 'express'
import { serveImageController } from '~/controllers/static.controller'

const routes = express.Router()

routes.get('/:name', serveImageController)

export default routes