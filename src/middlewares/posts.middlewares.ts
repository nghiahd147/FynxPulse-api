import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { EmotionTypes, PostAudience } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { POST_MESSAGES } from '~/constants/messages'
import { ErrorWithHandler } from '~/models/Errors'
import databaseServices from '~/services/database.services'
import { validate } from '~/utils/validation'

export const createPostValidator = validate(
  checkSchema({
    type: {
      notEmpty: {
        errorMessage: POST_MESSAGES.TYPE_MUST_BE_NOT_EMPTY
      },
      isIn: {
        options: [['Post', 'Repost', 'Comment', 'QuotePost']],
        errorMessage: POST_MESSAGES.NOT_A_POST_TYPE
      }
    },
    content: {
      notEmpty: {
        errorMessage: POST_MESSAGES.CONTENT_MUST_BE_NOT_EMPTY
      },
      isString: {
        errorMessage: POST_MESSAGES.CONTENT_MUST_BE_STRING
      }
    },
    audience: {
      notEmpty: {
        errorMessage: POST_MESSAGES.AUDIENCE_MUST_BE_NOT_EMPTY
      },
      isIn: {
        options: [[PostAudience.Everyone, PostAudience.Friends, PostAudience.FynxCircle]],
        errorMessage: POST_MESSAGES.NOT_AN_AUDIENCE_TYPE
      }
    }
  })
)
