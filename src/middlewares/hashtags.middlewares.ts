import { checkSchema } from 'express-validator'

export const hashTagMiddleware = checkSchema({
  name: {
    isString: true,
    notEmpty: true,
    trim: true
  }
})
