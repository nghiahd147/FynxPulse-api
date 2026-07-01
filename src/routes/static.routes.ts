import express from 'express'
import {
  serveM3U8Controller,
  serveImageController,
  serveVideoStreamController,
  serverProgController
} from '~/controllers/static.controller'

const routes = express.Router()

routes.get('/images/:name', serveImageController)
routes.get('/videos-stream/:name', serveVideoStreamController)
routes.get('/hls-stream/:id/master.m3u8', serveM3U8Controller)
routes.get('/hls-stream/:id/:v/:file', serverProgController)

export default routes
