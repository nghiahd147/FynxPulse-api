import { checkSchema } from 'express-validator'
import { POST_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const createPostValidator = validate(
  checkSchema({
    author_id: {
      notEmpty: {
        errorMessage: POST_MESSAGES.AUTHOR_ID_MUST_BE_NOT_EMPTY
      },
      isString: {
        errorMessage: POST_MESSAGES.AUTHOR_ID_MUST_BE_STRING
      }
    },
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
        options: [['everyone', 'fynx_circle']],
        errorMessage: POST_MESSAGES.NOT_AN_AUDIENCE_TYPE
      }
    }
  })
)
