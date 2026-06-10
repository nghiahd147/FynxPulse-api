import { Request, Response } from 'express'
import { MEDIA_MESSAGE } from '~/constants/messages'
import mediaServices from '~/services/media.services'

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const result = await mediaServices.uploadSingleImage(req)
  return res.json({
    message: MEDIA_MESSAGE.UPLOAD_SUCCESS,
    result
  })
}
