import { ObjectId } from 'mongodb'
import { EmotionTypes } from '~/constants/enum'

interface ReactionType {
  _id?: ObjectId
  post_id: ObjectId
  user_id: ObjectId
  type: EmotionTypes
  created_at: Date
}

export default class Reaction {
  _id?: ObjectId
  post_id: ObjectId
  user_id: ObjectId
  type: EmotionTypes
  created_at: Date
  constructor(payload: ReactionType) {
    this._id = payload._id
    this.post_id = payload.post_id
    this.user_id = payload.user_id
    this.type = payload.type || EmotionTypes.Like
    this.created_at = payload.created_at || new Date()
  }
}
