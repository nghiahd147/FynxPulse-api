import { ObjectId } from 'mongodb'
import { PostAudience, TypeMedia, TypePost } from '~/constants/enum'

interface PostType {
  _id?: ObjectId
  author_id: ObjectId
  type: TypePost
  content: string
  media?: TypeMedia
  audience: PostAudience
  parent_id?: ObjectId
  hashtags?: ObjectId[]
  mentions?: ObjectId[]
  guest_view?: number
  user_view?: number
  like_count?: number
  comment_count?: number
  created_at?: Date
  updated_at?: Date
}

export default class Post {
  _id?: ObjectId
  author_id: ObjectId
  type: TypePost
  content: string
  media?: TypeMedia
  audience: PostAudience
  parent_id: ObjectId | null
  hashtags: ObjectId[]
  mentions: ObjectId[]
  guest_view: number
  user_view: number
  like_count: number
  comment_count: number
  created_at: Date
  updated_at: Date
  constructor(payload: PostType) {
    this._id = payload._id
    this.author_id = payload.author_id
    this.type = payload.type
    this.content = payload.content
    this.media = payload.media
    this.audience = payload.audience || PostAudience.everyone
    this.parent_id = payload.parent_id || null
    this.hashtags = payload.hashtags || []
    this.mentions = payload.mentions || []
    this.guest_view = payload.guest_view || 0
    this.user_view = payload.user_view || 0
    this.like_count = payload.like_count || 0
    this.comment_count = payload.comment_count || 0
    this.created_at = payload.created_at || new Date()
    this.updated_at = payload.updated_at || new Date()
  }
}
