import { Request, Response } from 'express'
import { PostRequest } from '~/models/requests/posts.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import postService from '~/services/posts.services'
import databaseServices from '~/services/database.services'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { POST_MESSAGES } from '~/constants/messages'
import { ObjectId } from 'mongodb'

export const getAllPostsController = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1
  const page_size = parseInt(req.query.page_size as string) || 10
  const current = (page - 1) * page_size
  const hashtag = req.query.hashtag as string
  const search = req.query.search as string
  const type = req.query.type as string
  const date_from = req.query.date_from as string
  const date_to = req.query.date_to as string

  const filters = {}

  if (search) {
    Object.assign(filters, {
      content: {
        $regex: search,
        $options: 'i'
      }
    })
  }

  if (hashtag) {
    Object.assign(filters, {
      hashtags: {
        $in: [hashtag]
      }
    })
  }

  if (type) {
    Object.assign(filters, {
      type: {
        $regex: type,
        $options: 'i'
      }
    })
  }

  if (date_from && date_to) {
    Object.assign(filters, {
      created_at: {
        $gte: new Date(date_from),
        $lte: new Date(date_to)
      }
    })
  }

  const result = await databaseServices
    .posts()
    .aggregate([
      {
        $match: filters
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author_id',
          foreignField: '_id',
          pipeline: [
            {
              $project: { first_name: 1, last_name: 1 }
            }
          ],
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $unset: 'author_id'
      }
    ])
    .skip(current)
    .limit(page_size)
    .toArray()
  const total = await databaseServices.posts().countDocuments()

  return res.status(200).json({
    page,
    page_size,
    total,
    result
  })
}

export const getPostsByAuthorIdController = async (req: Request, res: Response) => {
  const { author_id } = req.params
  const result = await postService.getPostByAuthor(author_id)
  return res.status(200).json({
    result,
    message: POST_MESSAGES.GET_POST_BY_AUTHOR_ID_SUCCESS
  })
}

export const createPostController = async (req: Request<ParamsDictionary, any, PostRequest>, res: Response) => {
  const { user_id } = req.decoded_authorization
  const result = await postService.createPost(req.body, user_id)
  return res.status(200).json({
    data: result,
    message: POST_MESSAGES.CREATE_POST_SUCCESS
  })
}

export const getPostDetail = async (req: Request, res: Response) => {
  const { id } = req.params
  const post = await databaseServices.posts().findOne({ _id: new ObjectId(id) })

  if (!post) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: POST_MESSAGES.POST_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }

  return res.status(HTTP_STATUS.OK).json({
    result: post,
    message: POST_MESSAGES.GET_POST_DETAIL_SUCCESS
  })
}

export const deletePostController = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await postService.deletePost(id)
  return res.status(200).json(result)
}
