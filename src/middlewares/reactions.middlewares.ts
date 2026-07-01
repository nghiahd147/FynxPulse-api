import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { EmotionTypes } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { POST_MESSAGES, REACTION_MESSAGE } from '~/constants/messages'
import { ErrorWithHandler } from '~/models/Errors'
import databaseServices from '~/services/database.services'
import { validate } from '~/utils/validation'

const postIdSchema: ParamSchema = {
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
}

export const reactionPostValidator = validate(
  checkSchema({
    post_id: postIdSchema,
    type: {
      notEmpty: {
        errorMessage: REACTION_MESSAGE.TYPE_MUST_BE_NOT_EMPTY
      },
      isIn: {
        options: [[EmotionTypes.Like, EmotionTypes.Haha, EmotionTypes.Heart, EmotionTypes.Wow, EmotionTypes.Sad]],
        errorMessage: REACTION_MESSAGE.NOT_AN_EMOTION_TYPE
      }
    }
  })
)

export const unReactionPostValidator = validate(
  checkSchema({
    post_id: postIdSchema,
  })
)
