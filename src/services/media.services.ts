import { Request } from 'express'
import { File } from 'formidable'
import path from 'path'
import sharp from 'sharp'
import { getFullName, handlerUploadSingleImage } from '~/utils/file'

class MediaServices {
    async uploadSingleImage(req: Request) {
        const file = (await handlerUploadSingleImage(req)) as File
        const newName = getFullName(file)
        const newPath = path.resolve('uploads', `${newName}.jpg`)
        const info = sharp(file.filepath).jpeg().toFile(newPath)
        return info
    }
}

const mediaServices = new MediaServices()
export default mediaServices