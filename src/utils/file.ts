import { Request } from 'express'
import fs from 'fs'
import path from 'path'

export const initFolder = () => {
  const uploadFolder = path.resolve('uploads')
  if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder)
  }
}

export const handlerUploadSingleImage = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 300 * 1024,
    filter: ({ name, originalFilename, mimetype }) => {
      const valid = name === 'image' && Boolean(mimetype?.includes('image'))
      if (!valid) {
        throw Error('File is not type exist')
      }
      return valid
    }
  })
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        throw Error('File is empty')
      }
      resolve(files)
    })
  })
}
