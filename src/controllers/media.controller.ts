import { Request, Response } from 'express'
import { handlerUploadSingleImage } from '~/utils/file'

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const result = await handlerUploadSingleImage(req)
  return res.json({
    result
  })
}
