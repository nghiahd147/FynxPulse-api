import express from 'express'
import {
  getHashTagsController,
  getDetailHashTag,
  createHashTag,
  updateHashTag,
  deleteHashTag
} from '~/controllers/hashtags.controller'
import { hashTagMiddleware, hashTagUpdateMiddleware } from '~/middlewares/hashtags.middlewares'

const router = express.Router()

router.get('/', getHashTagsController)
router.get('/:id', getDetailHashTag)
router.post('/add', hashTagMiddleware, createHashTag)
router.put('/:id', hashTagUpdateMiddleware, updateHashTag)
router.delete('/:id', deleteHashTag)

export default router
