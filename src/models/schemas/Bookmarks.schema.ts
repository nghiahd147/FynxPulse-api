import { ObjectId } from 'mongodb'

interface BookmarkType {
  _id?: ObjectId
  post_id: ObjectId
  user_id: ObjectId
  created_at?: Date
}

export default class Bookmarks {
  _id?: ObjectId
  post_id: ObjectId
  user_id: ObjectId
  created_at?: Date
  constructor({ _id, post_id, user_id, created_at }: BookmarkType) {
    this._id = _id
    this.post_id = post_id
    this.user_id = user_id
    this.created_at = created_at
  }
}
