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
import { EncodeVideoStatus, TypeMedia } from '~/constants/enum'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import databaseServices from './database.services'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import { VIDEO_STATUS_MESSAGE } from '~/constants/messages'
import { ObjectId } from 'mongodb'
config()

class Queue {
    items: string[]
    encoding: boolean
    constructor() {
        this.items = []
        this.encoding = false 
    }
    async enqueue(item: string) {
        this.items.push(item)
        const idName = getFullName(item.split('/').pop() as string)
        await databaseServices.videoStatus().insertOne(new VideoStatus({
            name: idName,
            status: EncodeVideoStatus.Pending,
            message: VIDEO_STATUS_MESSAGE.ENCODED_PENDING
        }))
        this.processEncoded()
    }
    async processEncoded() {
        if(this.encoding) return false
        if(this.items.length > 0) {
            this.encoding = true
            const videoPath = this.items[0]
            const idName = getFullName(videoPath.split('/').pop() as string)
            await databaseServices.videoStatus().updateOne({
                name: idName,
            }, {
                $set: {
                    status: EncodeVideoStatus.Processing,
                    message: VIDEO_STATUS_MESSAGE.ENCODED_PROCESSING
                },
                $currentDate: {
                    updated_at: true
                }
            })
            try {
                await encodeHLSWithMultipleVideoStreams(videoPath)
                this.items.shift()
                await fsPromise.unlink(videoPath)
                await databaseServices.videoStatus().updateOne({
                    name: idName,
                }, {
                    $set: {
                        status: EncodeVideoStatus.Success,
                        message: VIDEO_STATUS_MESSAGE.ENCODED_SUCCESS
                    },
                    $currentDate: {
                        updated_at: true
                    }
                })
                console.log(`Encoded video ${videoPath} success`)       
            } catch (error) {
                await databaseServices.videoStatus().updateOne({
                    name: idName,
                }, {
                    $set: {
                        status: EncodeVideoStatus.Failed,
                        message: VIDEO_STATUS_MESSAGE.ENCODED_FAILED
                    },
                    $currentDate: {
                        updated_at: true
                    }
                }).catch(err => console.log('Encoded video error', err))
                console.log(`Encoded video ${videoPath} error`, error)
            }
            this.encoding = false
            this.processEncoded()
        } else {
            console.log(`Encoded video is empty`)
            return
        }
    }
}

const queue = new Queue()

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
                const newName = getFullName(file.newFilename)
                queue.enqueue(file.filepath)
                return {
                    url: isProduction ? `${process.env.HOST}/static/hls-stream/${newName}/master.m3u8` : `http://localhost:${process.env.PORT}/static/hls-stream/${newName}/master.m3u8`,
                    type: TypeMedia.HLS
                }
            })
        )
        return result
    }
    async getVideoStatus(id: string) {
        const result = await databaseServices.videoStatus().findOne({_id: new ObjectId(id)})
        return result
    }
}

const mediaServices = new MediaServices()
export default mediaServices