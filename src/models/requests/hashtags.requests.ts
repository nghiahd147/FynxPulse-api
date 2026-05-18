import { ObjectId } from 'mongodb'

export type CreateHashTagRequest = {
  _id: ObjectId
  name: string
  created_at: Date
  updated_at: Date
}
