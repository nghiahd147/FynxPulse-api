import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { COMMENT_MESSAGE } from '~/constants/messages'
import commentServices from '~/services/comments.services'
import databaseServices from '~/services/database.services'

export const getCommentsController = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1
  const page_size = Number(req.query.page_size) || 10
  const current = (page - 1) * page_size
  const search = req.query.search
  const date_from = req.query.date_from as string
  const date_to = req.query.date_to as string

  const filters = {}

  if (search) {
    Object.assign(filters, {
      content: { $regex: search, $options: 'i' }
    })
  }

  if (date_from || date_to) {
    Object.assign(filters, {
      created_at: {
        ...(date_from && { $gte: new Date(date_from) }),
        ...(date_to && { $lte: new Date(date_to) })
      }
    })
  }

  const comments = await databaseServices.comments().find(filters).limit(page_size).skip(current).toArray()
  const total = await databaseServices.comments().countDocuments()

  return res.status(HTTP_STATUS.OK).json({
    page,
    page_size,
    total,
    data: comments
  })
}

export const getCommentDetailController = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await commentServices.getCommentDetail(id)
  return res.status(HTTP_STATUS.OK).json({
    message: COMMENT_MESSAGE.GET_COMMENTS_BY_POST_ID,
    result
  })
}

export const getCommentsByPostId = async (req: Request, res: Response) => {
  const { post_id } = req.params
  const result = await commentServices.getCommentsPost(post_id)
  return res.status(HTTP_STATUS.OK).json({
    message: COMMENT_MESSAGE.GET_COMMENTS_BY_POST_ID,
    data: result
  })
}

export const createCommentController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const { post_id, content } = req.body
  await commentServices.createComment({ user_id, post_id, content })
  return res.status(HTTP_STATUS.CREATED).json({
    message: COMMENT_MESSAGE.CREATED_COMMENT_SUCCESS
  })
}

export const deleteCommentController = async (req: Request, res: Response) => {
  const { id } = req.params

  const comment = await databaseServices.comments().findOne({ _id: new ObjectId(id) })

  if (!comment) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: COMMENT_MESSAGE.COMMENT_NOT_FOUND
    })
  }

  await databaseServices.comments().deleteOne({ _id: new ObjectId(id) })
  await databaseServices.posts().updateOne({ _id: comment.post_id }, { $inc: { comment_count: -1 } })

  return res.status(HTTP_STATUS.OK).json({
    message: COMMENT_MESSAGE.DELETE_COMMENT_SUCCESS
  })
}
