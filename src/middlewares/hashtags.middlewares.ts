import { checkSchema } from 'express-validator'
import hashTagServices from '~/services/hashtags.services'
import { validate } from '~/utils/validation'

export const hashTagMiddleware = validate(
  checkSchema({
    name: {
      isString: true,
      notEmpty: true,
      trim: true,
      custom: {
        options: async (value) => {
          const hashTagName = await hashTagServices.checkNameHashTag(value)
          if (hashTagName) {
            throw new Error('Name hashtag is exist')
          }
          return true
        }
      }
    },
    created_at: {
      isISO8601: true,
      notEmpty: true
    },
    update_at: {
      isISO8601: true,
      notEmpty: true
    }
  })
)
