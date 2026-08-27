import express from 'express'
import { searchController } from '~/controllers/search.controller'
import { accessTokenValidator, verifiedEmailValidator } from '~/middlewares/users.middlewares'
import { wrapHandlers } from '~/utils/handlers'

const searchRouter = express.Router()

searchRouter.get('/', accessTokenValidator, verifiedEmailValidator, wrapHandlers(searchController))

export default searchRouter
