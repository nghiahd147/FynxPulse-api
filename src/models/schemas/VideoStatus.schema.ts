import { ObjectId } from "mongodb";
import { EncodeVideoStatus } from "~/constants/enum";

interface VideoStatusType {
    _id?: ObjectId
    name: string
    message: string
    status: EncodeVideoStatus
    created_at?: Date
    updated_at?: Date
}

export default class VideoStatus {
    _id?: ObjectId
    name: string
    message: string
    status: EncodeVideoStatus
    created_at?: Date
    updated_at?: Date
    constructor(videoStatus: VideoStatusType) {
        this._id = videoStatus._id
        this.name = videoStatus.name
        this.message = videoStatus.message
        this.status = videoStatus.status
        this.created_at = videoStatus.created_at || new Date()
        this.updated_at = videoStatus.updated_at || new Date()
    }
}