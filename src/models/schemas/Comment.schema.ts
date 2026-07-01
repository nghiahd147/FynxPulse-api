import { ObjectId } from 'mongodb'

interface CommentType {
  _id?: ObjectId
  post_id: ObjectId
  author_id: ObjectId
  content: string
  created_at?: Date
  updated_at?: Date
}

export class Comment {
  _id?: ObjectId
  post_id: ObjectId
  author_id: ObjectId
  content: string
  created_at?: Date
  updated_at?: Date
  constructor(comment: CommentType) {
    this._id = comment._id
    this.post_id = comment.post_id
    this.author_id = comment.author_id
    this.content = comment.content
    this.created_at = comment.created_at || new Date()
    this.updated_at = comment.updated_at || new Date()
  }
}
