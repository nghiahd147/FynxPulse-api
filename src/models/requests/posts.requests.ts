import { EmotionTypes, PostAudience, TypePost } from '~/constants/enum'
import { Media } from '../Other'

export interface PostRequest {
  author_id?: string
  type: TypePost
  content: string
  audience: PostAudience
  medias: Media[]
  mentions: string[]
  hashtags: string[]
  parent_id: string | null
}

export interface ReactionPostRequest {
  post_id: string
  type: EmotionTypes
}
