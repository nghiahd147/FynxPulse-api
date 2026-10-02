import { ObjectId } from 'mongodb'

interface ConversationType {
  _id?: ObjectId
  sender_id: ObjectId
  receiver_id: ObjectId
  content: string
  created_at?: Date
  updated_at?: Date
}

export default class Conversations {
  _id?: ObjectId
  sender_id: ObjectId
  receiver_id: ObjectId
  content: string
  created_at?: Date
  updated_at?: Date
  constructor(conversation: ConversationType) {
    this._id = conversation._id
    this.sender_id = conversation.sender_id
    this.receiver_id = conversation.receiver_id
    this.content = conversation.content
    this.created_at = conversation.created_at || new Date()
    this.updated_at = conversation.updated_at || new Date()
  }
}
