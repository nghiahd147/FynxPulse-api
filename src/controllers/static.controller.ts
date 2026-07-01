import { Request, Response } from 'express'
import path from 'path'
import fs from 'fs'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/uploads'
import mime from 'mime'

export const serveImageController = (req: Request, res: Response) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      res.status(HTTP_STATUS.NOT_FOUND).send('Not Found !!!')
    }
  })
}

export const serveVideoStreamController = (req: Request, res: Response) => {
  const { range } = req.headers
  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Requires range headers' })
  }
  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name as string)
  const videoSize = fs.statSync(videoPath).size
  const chunkSize = 10 ** 6
  const start = Number(range.replace(/bytes=/, '').split('-')[0])
  const end = Math.min(start + chunkSize, videoSize - 1)
  const contentLength = end - start + 1
  const contentType = mime.getType(videoPath) || 'video/*'
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
  const videoStreams = fs.createReadStream(videoPath, { start, end })
  videoStreams.pipe(res)
}

export const serveM3U8Controller = (req: Request, res: Response) => {
  const { id } = req.params
  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, 'master.m3u8'), (err) => {
    if (err) {
      res.status(HTTP_STATUS.NOT_FOUND).send('Not Found !!!')
    }
  })
}

export const serverProgController = (req: Request, res: Response) => {
  const { id, v, file } = req.params
  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, v, file), (err) => {
    if (err) {
      res.status(HTTP_STATUS.NOT_FOUND).send('Not Found !!!')
    }
  })
}
