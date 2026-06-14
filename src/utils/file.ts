import { Request } from 'express'
import { File } from 'formidable'
import fs from 'fs'
import { UPLOAD_IMAGE_DIR_TEMP, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_DIR_TEMP } from '~/constants/uploads'

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
    uploadDir: UPLOAD_VIDEO_DIR,
    // keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024,
    filter: ({ name, originalFilename, mimetype }) => {
      const valid = name === 'video' && Boolean(mimetype?.includes('mp4'))
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
      if (!Boolean(files.video)) {
        throw Error('File is empty')
      }
      files.video?.map(async(item) => {
        const ext = getExtensionName(item.originalFilename as string)
        fs.renameSync(item.filepath, item.filepath + "." + ext)
        item.newFilename = item.newFilename + "." + ext
      })
      resolve((files.video as File[]))
    })
  })
}

export const getFullName = (file: File) => {
  const name = file.newFilename.split('.').shift()
  return name
}

export const getExtensionName = (originalFilename: string) => {
  const extension = originalFilename.split(".").pop()
  return extension
}
