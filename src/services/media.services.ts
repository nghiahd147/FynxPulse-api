import { Request } from 'express'
import { File } from 'formidable'
import path from 'path'
import sharp from 'sharp'
import { getFullName, handlerUploadSingleImage } from '~/utils/file'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
config()

class MediaServices {
    async uploadSingleImage(req: Request) {
        const file = (await handlerUploadSingleImage(req)) as File
        const newName = getFullName(file)
        const newPath = path.resolve('uploads', `${newName}.jpg`)
        await sharp(file.filepath).jpeg().toFile(newPath)
        fs.unlinkSync(file.filepath)
        return isProduction ? `${process.env.HOST}/images/${newName}.jpg` : `http://localhost:${process.env.PORT}/images/${newName}.jpg`
    }
}

const mediaServices = new MediaServices()
export default mediaServices