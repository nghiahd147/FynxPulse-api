import { Request, Response } from 'express'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { BOOKMARK_MESSAGE } from '~/constants/messages'
import bookmarksServices from '~/services/bookmarks.services'

export const createBookMarkController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const { post_id } = req.body
  const result = await bookmarksServices.createBookmarks(user_id, post_id)
  return res.status(HTTP_STATUS.OK).json({
    messsage: BOOKMARK_MESSAGE.CREATE_BOOKMARK_SUCCESSFULLY,
    result
  })
}

export const deleteBookMarkController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization
  const { post_id } = req.params
  await bookmarksServices.deleteBookmark(user_id, post_id)
  return res.status(HTTP_STATUS.OK).json({
    messsage: BOOKMARK_MESSAGE.DELETE_BOOKMARK_SUCCESSFULLY
  })
}
