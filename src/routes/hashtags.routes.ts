import express from 'express'
import { getHashTagsController, getDetailHashTag } from '~/controllers/hashtags.controller'

const router = express.Router()

router.get('/', getHashTagsController)
router.get('/:id', getDetailHashTag)

export default router
