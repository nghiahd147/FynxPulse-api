import { ObjectId } from 'mongodb'
import { PostAudience, TypeMedia, TypePost } from '~/constants/enum'
import { Media } from '../Other'
import HashTag from './Hashtags.schema'

interface PostType {
  _id?: ObjectId
  author_id: ObjectId
  type: TypePost
  content: string
  medias: Media[]
  audience: PostAudience
  parent_id: string | null
  hashtags: HashTag[]
  mentions: string[] | null
  guest_views?: number
  user_views?: number
  created_at?: Date
  updated_at?: Date
}

export default class Post {
  _id?: ObjectId
  author_id: ObjectId
  type: TypePost
  content: string
  medias: Media[]
  audience: PostAudience
  parent_id: ObjectId | null
  hashtags: HashTag[]
  mentions: ObjectId[] | null
  guest_views?: number
  user_views?: number
  created_at?: Date
  updated_at?: Date
  constructor(payload: PostType) {
    this._id = payload._id
    this.author_id = payload.author_id
    this.type = payload.type
    this.content = payload.content
    this.medias = payload.medias
    this.audience = payload.audience || PostAudience.Everyone
    this.parent_id = payload.parent_id ? new ObjectId(payload.parent_id) : null
    this.hashtags = payload.hashtags || []
    this.mentions = payload.mentions?.map((mention) => new ObjectId(mention)) || []
    this.guest_views = payload.guest_views ?? 0
    this.user_views = payload.user_views ?? 0
    this.created_at = payload.created_at || new Date()
    this.updated_at = payload.updated_at || new Date()
  }
}
