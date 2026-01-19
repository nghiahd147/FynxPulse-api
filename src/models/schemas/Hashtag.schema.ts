import { ObjectId } from 'mongodb'

interface HashTagType {
  _id: ObjectId
  name: string
  created_at: Date
}

export default class HashTag {
  _id: ObjectId
  name: string
  created_at: Date

  constructor(hastag: HashTagType) {
    this._id = hastag._id
    this.name = hastag.name
    this.created_at = hastag.created_at
  }
}
