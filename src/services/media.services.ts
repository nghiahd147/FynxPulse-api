import { Request } from 'express'
import { File } from 'formidable'
import path from 'path'
import sharp from 'sharp'
import { getFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import fs from 'fs'
import fsPromise from 'fs/promises'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { Media } from '~/models/Other'
import { TypeMedia } from '~/constants/enum'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
config()

class MediaServices {
    async uploadImage(req: Request) {
        const files = (await handleUploadImage(req)) as File[]
        const result: Media[] = await Promise.all(
            files.map(async (file) => {
                const newName = getFullName(file.newFilename)
                const newPath = path.resolve('uploads/images', `${newName}.jpg`)
                await sharp(file.filepath).jpeg().toFile(newPath)
                fs.unlinkSync(file.filepath)
                return {
                    url: isProduction ? `${process.env.HOST}/static/images/${newName}.jpg` : `http://localhost:${process.env.PORT}/static/images/${newName}.jpg`,
                    type: TypeMedia.Image
                }
            })
        )
        return result
    }
    async uploadVideo(req: Request) {
        const files = await handleUploadVideo(req)
        const result = await Promise.all(
            files.map(file => {
                const { newFilename } = file
                return {
                    url: isProduction ? `${process.env.HOST}/static/videos-stream/${newFilename}` : `http://localhost:${process.env.PORT}/static/videos-stream/${newFilename}`,
                    type: TypeMedia.Video
                }
            })
        )
        return result
    }
    async uploadVideoHLS(req: Request) {
        const files = await handleUploadVideo(req)
        const result = await Promise.all(
            files.map(async (file) => {
                await encodeHLSWithMultipleVideoStreams(file.filepath)
                const newName = getFullName(file.newFilename)
                await fsPromise.unlink(file.filepath)
                return {
                    url: isProduction ? `${process.env.HOST}/static/hls-stream/${newName}/master.m3u8` : `http://localhost:${process.env.PORT}/static/hls-stream/${newName}/master.m3u8`,
                    type: TypeMedia.HLS
                }
            })
        )
        return result
    }
}

const mediaServices = new MediaServices()
export default mediaServices