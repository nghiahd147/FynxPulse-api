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

export const uploadVideoHLSController = async (req: Request, res: Response) => {
  const result = await mediaServices.uploadVideoHLS(req)
  return res.json({
    message: MEDIA_MESSAGE.UPLOAD_VIDEO_HLS_SUCCESS,
    result
  })
}

export const videoStatusController = async (req: Request, res: Response) => {
  const {id} = req.params
  const result = await mediaServices.getVideoStatus(id)
  return res.json({
    message: MEDIA_MESSAGE.GET_VIDEO_STATUS_SUCCESS,
    result
  })
}