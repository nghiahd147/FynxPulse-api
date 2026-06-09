import { Request } from 'express'
import { File } from 'formidable'
import path from 'path'
import sharp from 'sharp'
import { getFullName, handlerUploadSingleImage } from '~/utils/file'
import fs from 'fs'

class MediaServices {
    async uploadSingleImage(req: Request) {
        const file = (await handlerUploadSingleImage(req)) as File
        const newName = getFullName(file)
        const newPath = path.resolve('uploads', `${newName}.jpg`)
        await sharp(file.filepath).jpeg().toFile(newPath)
        fs.unlinkSync(file.filepath)
        return `http://localhost:5000/uploads/${newName}.jpg`
    }
}

const mediaServices = new MediaServices()
export default mediaServices