import express from 'express'
import { getHashTagsController, getDetailHashTag, createHashTag } from '~/controllers/hashtags.controller'
import { hashTagMiddleware } from '~/middlewares/hashtags.middlewares'

const router = express.Router()

router.get('/', getHashTagsController)
router.get('/:id', getDetailHashTag)
router.post('/add', hashTagMiddleware, createHashTag)

export default router
