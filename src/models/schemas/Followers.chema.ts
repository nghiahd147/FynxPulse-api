import { ObjectId } from 'mongodb'

interface FollowerType {
  _id?: ObjectId
  user_id: ObjectId
  follower_user_id: ObjectId
  created_at?: Date
}

export default class Followers {
  _id?: ObjectId
  user_id: ObjectId
  follower_user_id: ObjectId
  created_at: Date
  constructor(follower: FollowerType) {
    this._id = follower._id
    this.user_id = follower.user_id
    this.follower_user_id = follower.follower_user_id
    this.created_at = follower.created_at || new Date()
  }
}
