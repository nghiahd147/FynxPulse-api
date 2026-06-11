import { Request, Response } from 'express'
import { MEDIA_MESSAGE } from '~/constants/messages'
import mediaServices from '~/services/media.services'

export const uploadImageController = async (req: Request, res: Response) => {
  const result = await mediaServices.uploadImage(req)
  return res.json({
    message: MEDIA_MESSAGE.UPLOAD_IMAGE_SUCCESS,
    result
  })
}

export const uploadVideoController = async (req: Request, res: Response) => {
  const result = await mediaServices.uploadVideo(req)
  return res.json({
    message: MEDIA_MESSAGE.UPLOAD_VIDEO_SUCCESS,
    result
  })
}
