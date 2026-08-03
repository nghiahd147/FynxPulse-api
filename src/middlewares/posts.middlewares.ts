import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { PostAudience, TypeMedia, TypePost, UserVerifyStatus } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { POST_MESSAGES, USER_MESSAGES } from '~/constants/messages'
import { ErrorWithHandler } from '~/models/Errors'
import { Media } from '~/models/Other'
import Post from '~/models/schemas/Posts.schema'
import databaseServices from '~/services/database.services'
import { numberEnumToArray } from '~/utils/common'
import { wrapHandlers } from '~/utils/handlers'
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
            [TypePost.Post, TypePost.Comment, TypePost.QuotePost].includes(type) &&
            isEmpty(hashtags) &&
            isEmpty(mentions) &&
            value === ''
          ) {
            throw new Error(POST_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING_WITHOUT_HASHTAGS_OR_MENTIONS)
          }
          if (TypePost.Repost === type && value !== '') {
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
          const [post] = await databaseServices
            .posts()
            .aggregate<Post>([
              {
                $match: {
                  _id: new ObjectId(value)
                }
              },
              {
                $lookup: {
                  from: 'hashtags',
                  localField: 'hashtags',
                  foreignField: '_id',
                  as: 'hashtags'
                }
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'mentions',
                  foreignField: '_id',
                  as: 'mentions'
                }
              },
              {
                $addFields: {
                  mentions: {
                    $map: {
                      input: '$mentions',
                      as: 'mention',
                      in: {
                        _id: '$$mention._id',
                        name: '$$mention.name',
                        username: '$$mention.username',
                        email: '$$mention.email'
                      }
                    }
                  }
                }
              },
              {
                $lookup: {
                  from: 'bookmarks',
                  localField: '_id',
                  foreignField: 'post_id',
                  as: 'bookmarks'
                }
              },
              {
                $lookup: {
                  from: 'reactions',
                  localField: '_id',
                  foreignField: 'post_id',
                  as: 'reactions'
                }
              },
              {
                $lookup: {
                  from: 'posts',
                  localField: '_id',
                  foreignField: 'parent_id',
                  as: 'post_children'
                }
              },
              {
                $addFields: {
                  bookmarks: {
                    $size: '$bookmarks'
                  },
                  reactions: {
                    $size: '$reactions'
                  },
                  repost_count: {
                    $size: {
                      $filter: {
                        input: '$post_children',
                        as: 'item',
                        cond: {
                          $eq: ['$$item.type', TypePost.Repost]
                        }
                      }
                    }
                  },
                  commentpost_count: {
                    $size: {
                      $filter: {
                        input: '$post_children',
                        as: 'item',
                        cond: {
                          $eq: ['$$item.type', TypePost.Comment]
                        }
                      }
                    }
                  },
                  quotepost_count: {
                    $size: {
                      $filter: {
                        input: '$post_children',
                        as: 'item',
                        cond: {
                          $eq: ['$$item.type', TypePost.QuotePost]
                        }
                      }
                    }
                  }
                }
              },
              {
                $project: {
                  post_children: 0
                }
              }
            ])
            .toArray()
          if (!post) {
            throw new ErrorWithHandler({
              message: POST_MESSAGES.POST_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          req.post = post
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

export const audienceValidator = wrapHandlers(async (req: Request, res: Response, next: NextFunction) => {
  const post = req.post as Post
  if (post.audience === PostAudience.FynxCircle) {
    if (!req.headers.authorization) {
      throw new ErrorWithHandler({
        message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }
    const author = await databaseServices.users().findOne({ _id: new ObjectId(post.author_id) })
    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithHandler({
        message: USER_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const { user_id } = req.decoded_authorization
    const isUserInFynxCircle = author?.fynx_circle?.some((item) => item.equals(user_id))
    if (!isUserInFynxCircle && !post.author_id.equals(user_id)) {
      throw new ErrorWithHandler({
        message: POST_MESSAGES.POST_IS_NOT_PUBLIC,
        status: HTTP_STATUS.FOBIDDEN
      })
    }
  }
  next()
})

export const getPostChildrenValidator = validate(
  checkSchema(
    {
      post_type: {
        isIn: {
          options: [postType],
          errorMessage: POST_MESSAGES.INVALID_POST_TYPE
        }
      }
    },
    ['query']
  )
)

export const paginationValidator = validate(
  checkSchema({
    page_size: {
      isNumeric: true,
      custom: {
        options: (value, { req }) => {
          const num = Number(value)
          if (num > 100 || num < 1) {
            throw new Error('1 <= page_size <= 100')
          }
          return true
        }
      }
    },
    page: {
      isNumeric: true,
      custom: {
        options: (value, { req }) => {
          const num = Number(value)
          if (num < 1) {
            throw new Error('page => 1')
          }
          return true
        }
      }
    }
  })
)
