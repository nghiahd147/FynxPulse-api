import { Request } from 'express'
import { File } from 'formidable'
import path from 'path'
import sharp from 'sharp'
import { getFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { Media } from '~/models/Other'
import { TypeMedia } from '~/constants/enum'
config()

class MediaServices {
    async uploadImage(req: Request) {
        const files = (await handleUploadImage(req)) as File[]
        const result: Media[] = await Promise.all(
            files.map(async (file) => {
                const newName = getFullName(file)
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
        const files = (await handleUploadVideo(req)) as File
        const { newFilename } = files
        return {
            url: isProduction ? `${process.env.HOST}/static/videos/${newFilename}` : `http://localhost:${process.env.PORT}/static/videos/${newFilename}`,
            type: TypeMedia.Image
        }
    }
}

const mediaServices = new MediaServices()
export default mediaServices