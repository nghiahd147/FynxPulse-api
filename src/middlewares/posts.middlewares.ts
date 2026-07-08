import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { PostAudience, TypePost } from '~/constants/enum'
import { POST_MESSAGES } from '~/constants/messages'
import { numberEnumToArray } from '~/utils/common'
import { validate } from '~/utils/validation'

const postType = numberEnumToArray(TypePost)
const postAudience = numberEnumToArray(PostAudience)

export const createPostValidator = validate(
  checkSchema({
    type: {
      notEmpty: {
        errorMessage: POST_MESSAGES.TYPE_MUST_BE_NOT_EMPTY
      },
      isIn: {
        options: [postType],
        errorMessage: POST_MESSAGES.NOT_A_POST_TYPE
      }
    },
    parent_id: {
      custom: {
        options: async (value, { req }) => {
          const type = req.body.type
          if ([TypePost.Comment, TypePost.QuotePost, TypePost.Repost].includes(type) && !ObjectId.isValid(value)) {
            throw new Error(POST_MESSAGES.PARENT_ID_IS_VALID)
          }
          if (TypePost.Post === type && value !== null) {
            throw new Error(POST_MESSAGES.PARENT_ID_MUST_BE_NULL)
          }
        }
      }
    },
    content: {
      isString: {
        errorMessage: POST_MESSAGES.CONTENT_MUST_BE_STRING
      },
      custom: {
        options: async (value, { req }) => {
          const type = req.body.type
          const hashtags = req.body.hashtags as string[]
          const mentions = req.body.mentions as string[]
          if (
            [TypePost.Post, TypePost.Repost, TypePost.QuotePost].includes(type) &&
            isEmpty(hashtags) &&
            isEmpty(mentions) &&
            value === ''
          ) {
            throw new Error(POST_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING_WITHOUT_HASHTAGS_OR_MENTIONS)
          }
          if (TypePost.Comment === type && value !== '') {
            throw new Error(POST_MESSAGES.CONTENT_MUST_BE_AN_EMPTY_STRING)
          }
        }
      }
    },
    audience: {
      notEmpty: {
        errorMessage: POST_MESSAGES.AUDIENCE_MUST_BE_NOT_EMPTY
      },
      isIn: {
        options: [postAudience],
        errorMessage: POST_MESSAGES.NOT_AN_AUDIENCE_TYPE
      }
    }
  })
)
