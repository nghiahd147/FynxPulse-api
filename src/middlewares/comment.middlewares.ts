import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { COMMENT_MESSAGE, POST_MESSAGES } from '~/constants/messages'
import { ErrorWithHandler } from '~/models/Errors'
import databaseServices from '~/services/database.services'
import { validate } from '~/utils/validation'

export const createCommentValidator = validate(
  checkSchema(
    {
      post_id: {
        isString: {
          errorMessage: POST_MESSAGES.POST_ID_MUST_BE_A_STRING
        },
        custom: {
          options: async (value) => {
            if (!value) {
              throw new ErrorWithHandler({
                message: POST_MESSAGES.POST_ID_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const post = await databaseServices.posts().findOne({ _id: new ObjectId(value) })
            if (!post) {
              throw new ErrorWithHandler({
                message: POST_MESSAGES.POST_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            return true
          }
        }
      },
      content: {
        isString: {
          errorMessage: COMMENT_MESSAGE.COMMENT_MUST_BE_A_STRING
        },
        notEmpty: {
          errorMessage: COMMENT_MESSAGE.COMMENT_IS_NOT_EMPTY
        }
      }
    },
    ['body']
  )
)
