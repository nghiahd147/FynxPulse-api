import express from 'express'
import {
  getHashTagsController,
  getDetailHashTag,
  createHashTag,
  updateHashTag
} from '~/controllers/hashtags.controller'
import { hashTagMiddleware } from '~/middlewares/hashtags.middlewares'

const router = express.Router()

router.get('/', getHashTagsController)
router.get('/:id', getDetailHashTag)
router.post('/add', hashTagMiddleware, createHashTag)
router.put('/:id', updateHashTag)

export default router
