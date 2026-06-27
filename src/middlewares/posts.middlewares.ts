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

export const reactionPostValidator = validate(
  checkSchema({
    post_id: {
      isString: {
        errorMessage: POST_MESSAGES.POST_ID_MUST_BE_A_STRING
      },
      custom: {
        options: async (value, {req}) => {
          if(!value) {
            throw new ErrorWithHandler({
              message: POST_MESSAGES.POST_ID_IS_REQUIRED,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          console.log('value', value)
          const post = await databaseServices.posts().findOne({_id: new ObjectId(value)})
          console.log('post', post)
          if(!post) {
            throw new ErrorWithHandler({
              message: POST_MESSAGES.POST_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          return true
        }
      }
    },
    type: {
      notEmpty: {
        errorMessage: POST_MESSAGES.TYPE_MUST_BE_NOT_EMPTY
      },
      isIn: {
        options: [[EmotionTypes.Like, EmotionTypes.Haha, EmotionTypes.Heart, EmotionTypes.Wow, EmotionTypes.Sad]],
        errorMessage: POST_MESSAGES.NOT_AN_EMOTION_TYPE
      }
    }
  })
)