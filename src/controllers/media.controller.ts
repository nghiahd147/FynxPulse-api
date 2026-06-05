import { Request, Response } from 'express'
import mediaServices from '~/services/media.services'

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const result = await mediaServices.uploadSingleImage(req)
  return res.json({
    message: 'Upload success',
    result
  })
}
