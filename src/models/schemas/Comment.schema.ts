import { ObjectId } from 'mongodb'

interface CommentType {
  _id: ObjectId
  post_id: ObjectId
  author_id: ObjectId
  content: string
  create_at: Date
}

export class Comment {
  _id: ObjectId
  post_id: ObjectId
  author_id: ObjectId
  content: string
  create_at: Date
  constructor(comment: CommentType) {
    this._id = comment._id
    this.post_id = comment.post_id
    this.author_id = comment.author_id
    this.content = comment.content
    this.create_at = comment.create_at
  }
}
