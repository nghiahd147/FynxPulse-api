import { ObjectId } from 'mongodb'

export type CreateHashTagRequest = {
  _id: ObjectId
  name: string
  created_at: Date
  update_at: Date
}
