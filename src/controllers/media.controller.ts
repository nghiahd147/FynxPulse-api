import { Request, Response } from 'express'
import path from 'node:path'

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 300 * 1024
  })
  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err
    }
    res.json({
      message: 'Upload image success'
    })
  })
}
