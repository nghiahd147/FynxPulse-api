import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { PostAudience, TypeMedia, TypePost } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { POST_MESSAGES } from '~/constants/messages'
import { ErrorWithHandler } from '~/models/Errors'
import { Media } from '~/models/Other'
import databaseServices from '~/services/database.services'
import { numberEnumToArray } from '~/utils/common'
import { validate } from '~/utils/validation'

const postType = numberEnumToArray(TypePost)
const postAudience = numberEnumToArray(PostAudience)
const mediaType = numberEnumToArray(TypeMedia)

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
    },
    hashtags: {
      isArray: {
        errorMessage: POST_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY
      },
      custom: {
        options: async (value, { req }) => {
          if (value.some((hashtag: string) => typeof hashtag !== 'string')) {
            throw new Error(POST_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY)
          }
          return true
        }
      }
    },
    mentions: {
      isArray: {
        errorMessage: POST_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY
      },
      custom: {
        options: async (value, { req }) => {
          if (value.some((mention: string) => !ObjectId.isValid(mention))) {
            throw new Error(POST_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY)
          }
          return true
        }
      }
    },
    medias: {
      isArray: {
        errorMessage: POST_MESSAGES.MEDIA_MUST_BE_AN_ARRAY
      },
      custom: {
        options: async (value, { req }) => {
          if (
            value.some((media: Media) => {
              return typeof media.url !== 'string' || !mediaType.includes(media.type)
            })
          ) {
            throw new Error(POST_MESSAGES.NOT_A_MEDIA_TYPE)
          }
          return true
        }
      }
    }
  })
)

export const postIdValidator = validate(
  checkSchema({
    post_id: {
      custom: {
        options: async (value, { req }) => {
          if (!ObjectId.isValid(value)) {
            throw new ErrorWithHandler({
              message: POST_MESSAGES.POST_ID_IS_VALID,
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
  })
)

export const isUserLoggedValidator = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      return middleware(req, res, next)
    }
    next()
  }
}
