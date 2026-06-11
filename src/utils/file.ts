import { Request } from 'express'
import { File } from 'formidable'
import fs from 'fs'
import { UPLOAD_IMAGE_DIR_TEMP, UPLOAD_VIDEO_DIR_TEMP } from '~/constants/uploads'

export const initFolder = () => {
  const uploadFolder = [UPLOAD_IMAGE_DIR_TEMP, UPLOAD_VIDEO_DIR_TEMP]
  uploadFolder.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

export const handleUploadImage = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_DIR_TEMP,
    keepExtensions: true,
    maxFiles: 4,
    maxFileSize: 300 * 1024,
    maxTotalFileSize: 300 * 1024 * 4,
    filter: ({ name, originalFilename, mimetype }) => {
      const valid = name === 'image' && Boolean(mimetype?.includes('image'))
      if (!valid) {
        throw Error('File is not type exist')
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        throw Error('File is empty')
      }
      resolve((files.image as File[]))
    })
  })
}

export const handleUploadVideo = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR_TEMP,
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024,
    // filter: ({ name, originalFilename, mimetype }) => {
    //   const valid = name === 'image' && Boolean(mimetype?.includes('image'))
    //   if (!valid) {
    //     throw Error('File is not type exist')
    //   }
    //   return valid
    // }
  })
  return new Promise<File>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.video)) {
        throw Error('File is empty')
      }
      resolve((files.video as File[])[0])
    })
  })
}

export const getFullName = (file: File) => {
  const name = file.newFilename.split('.').shift()
  return name
}
