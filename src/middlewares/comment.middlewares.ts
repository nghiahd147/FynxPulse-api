import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'

export const createCommentValidator = validate(checkSchema({}))
